import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabase } from '@/lib/supabaseClient';

// Define a default progress structure
const defaultProgress = {
  letters_progress: 0,
  three_letter_words_progress: 0,
  four_letter_words_progress: 0,
  five_letter_words_progress: 0,
  sentences_progress: 0,
  total_stickers: 0,
  current_streak: 0,
  last_played_date: null,
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error code for "No rows found"
        // No progress record found, return default progress
        // Also, good practice to create a default record for the user here
        const { error: insertError } = await supabase
            .from('user_progress')
            .insert([{ user_id: userId, ...defaultProgress }]);
        if (insertError) {
            console.error('Error creating default progress for user:', userId, insertError);
            // proceed to return default progress anyway for this GET request
        }
        return NextResponse.json(defaultProgress);
      }
      console.error('Error fetching user progress:', error);
      return NextResponse.json({ error: 'Failed to fetch user progress' }, { status: 500 });
    }
    
    // Transform last_played_date to string if it's a Date object, or ensure it's null
    const progressData = data ? {
      ...data,
      last_played_date: data.last_played_date ? new Date(data.last_played_date).toISOString().split('T')[0] : null,
    } : defaultProgress;


    return NextResponse.json(progressData);
  } catch (e) {
    console.error('Exception fetching user progress:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  let progressData;

  try {
    progressData = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Validate or sanitize progressData here if necessary
  // For example, ensure only known fields are being updated.
  const {
    letters_progress,
    three_letter_words_progress,
    four_letter_words_progress,
    five_letter_words_progress,
    sentences_progress,
    total_stickers,
    current_streak,
    last_played_date,
    // Exclude id and user_id from the update payload if they are present
    // id: progressId, 
    // user_id: progressUserId, 
    ...rest // any other fields to ignore
  } = progressData;


  const dataToUpsert = {
    user_id: userId,
    letters_progress: letters_progress ?? defaultProgress.letters_progress,
    three_letter_words_progress: three_letter_words_progress ?? defaultProgress.three_letter_words_progress,
    four_letter_words_progress: four_letter_words_progress ?? defaultProgress.four_letter_words_progress,
    five_letter_words_progress: five_letter_words_progress ?? defaultProgress.five_letter_words_progress,
    sentences_progress: sentences_progress ?? defaultProgress.sentences_progress,
    total_stickers: total_stickers ?? defaultProgress.total_stickers,
    current_streak: current_streak ?? defaultProgress.current_streak,
    last_played_date: last_played_date ? new Date(last_played_date).toISOString().split('T')[0] : null,
    updated_at: new Date().toISOString(),
  };


  try {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(dataToUpsert, {
        onConflict: 'user_id', // user_id should be unique in user_progress
      })
      .select() // return the updated/inserted row
      .single();

    if (error) {
      console.error('Error upserting user progress:', error);
      return NextResponse.json({ error: 'Failed to save user progress' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error('Exception saving user progress:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
