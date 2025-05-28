# NextAuth.js Google Authentication Setup

To enable Google Authentication in this project, you need to configure OAuth 2.0 credentials in the Google Cloud Console and set up the required environment variables.

## 1. Create OAuth 2.0 Credentials in Google Cloud Console

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Navigate to **APIs & Services > Credentials**.
3.  Click **Create Credentials** and select **OAuth client ID**.
4.  Choose **Web application** as the application type.
5.  Give your OAuth client ID a name (e.g., "My Next.js App Auth").
6.  **Authorized JavaScript origins**:
    *   For local development, add `http://localhost:3000`.
    *   For production, add your production domain (e.g., `https://yourdomain.com`).
7.  **Authorized redirect URIs**:
    *   For local development, add `http://localhost:3000/api/auth/callback/google`.
    *   For production, add `https://yourdomain.com/api/auth/callback/google`.
8.  Click **Create**.
9.  Copy the **Client ID** and **Client secret**. You will need these for your environment variables.

## 2. Set Up Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't already exist) and add the following variables:

```
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
# You might also need to set NEXTAUTH_URL for production/Vercel deployments
# NEXTAUTH_URL="http://localhost:3000" # For development
# NEXTAUTH_URL="https://yourdomain.com" # For production
```

**Notes:**

*   Replace `"YOUR_GOOGLE_CLIENT_ID"` and `"YOUR_GOOGLE_CLIENT_SECRET"` with the values you obtained from the Google Cloud Console.
*   `NEXTAUTH_SECRET`: This is a secret key used to sign tokens and cookies. It is crucial for production environments.
    *   You can generate a strong secret using the following command in your terminal:
        ```bash
        openssl rand -hex 32
        ```
        or by using the `npx auth secret` command provided by `next-auth`.
    *   For development, if `NEXTAUTH_SECRET` is not set, NextAuth.js will generate a temporary one, but it's good practice to set it explicitly.
*   `NEXTAUTH_URL`: This variable should be set to the canonical URL of your site.
    *   In development, this is typically `http://localhost:3000`.
    *   In production, this is your live application URL.
    *   Vercel and some other hosting platforms might set this automatically.

After setting these environment variables, restart your development server for the changes to take effect.
