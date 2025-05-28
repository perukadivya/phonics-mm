import NextAuth, { AuthOptions, User as NextAuthUser, Account, Profile } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabase } from "@/lib/supabaseClient"

// For admin operations, one would typically initialize a separate client:
// import { createClient } from '@supabase/supabase-js'
// const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface UserProfile extends Profile {
  email_verified?: boolean;
  picture?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: NextAuthUser; account: Account | null; profile?: UserProfile }) {
      if (!profile || !profile.email) {
        console.error("SignIn callback: Profile or email missing.")
        return false; 
      }

      console.warn(`
        Critical assumption in signIn callback:
        The following upsert into 'public.users' requires that an entry with a corresponding ID
        already exists in 'auth.users' if the foreign key constraint (public.users.id -> auth.users.id) is active.
        This typically requires using a Supabase adapter with NextAuth or handling user creation
        in 'auth.users' via Supabase admin client using a service role key.
        The 'user.id' available here from Google (profile.sub) is NOT the Supabase auth.users.id.
        This part of the code will need to be implemented robustly by the developer by ensuring
        the ID used for 'public.users.id' is the one from 'auth.users'.
      `);
      
      // Placeholder for the actual Supabase auth user ID.
      // In a real scenario, this ID would come from creating/fetching the user in `auth.users`
      // (e.g. using supabase.auth.admin.createUser() or equivalent) and then used here.
      // For this example, we are proceeding with user.id from Google (profile.sub),
      // which will cause FK violation if it's not manually synced/present in auth.users.
      const idToUseInPublicUsers = user.id; // THIS IS THE CRITICAL POINT. See warning above.

      try {
        const { data: upsertedUserData, error: upsertError } = await supabase
          .from("users")
          .upsert(
            {
              id: idToUseInPublicUsers, // This ID MUST be the one from auth.users table.
              email: profile.email,
              name: profile.name,
            },
            {
              onConflict: "id", // If a user with this ID already exists, update email/name.
                                // Or use 'email' if email is the main conflict target for upsert.
                                // If 'id' is the PK and meant to align with auth.users.id, this is appropriate.
            }
          )
          .select('id')
          .single();

        if (upsertError) {
          console.error("Error upserting user in Supabase public.users:", upsertError);
          // A common error here would be FK violation if idToUseInPublicUsers doesn't exist in auth.users.id
          if (upsertError.code === '23503') { // Foreign key violation
            console.error("Foreign Key Violation: The user ID does not exist in auth.users table. User needs to be created in Supabase Auth first.");
          }
          return false; // Deny sign-in on DB error
        }
        
        if (upsertedUserData && upsertedUserData.id) {
            // Ensure the ID used in the token is the one from public.users (which should be auth.users.id)
            user.id = upsertedUserData.id; 
        } else {
            console.error("Upsert was successful but no ID returned from public.users, or ID mismatch.");
            return false;
        }

      } catch (e) {
        console.error("Exception during Supabase user upsert:", e);
        return false;
      }
      return true; // Allow sign-in
    },
    async jwt({ token, user, account, profile }) {
      if (user?.id) {
        token.sub = user.id; // Set token.sub to the ID from public.users (meant to be Supabase auth.users.id)
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub; // Pass the Supabase user ID to the session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Augment NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // This should be the Supabase user ID (from auth.users)
    } & Omit<NextAuthUser, 'id'> // Keep other default user properties like name, email, image, but use our 'id' type
  }
  // If you also need to ensure User object passed around in callbacks has this string id:
  // interface User extends Omit<NextAuthUser, 'id'> {
  //   id: string;
  // }
}
