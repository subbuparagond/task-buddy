import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const cookieStore = await cookies(); // Await the cookies function
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          async remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Exchange auth code for a session
    const { data: session, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      const { id, email, user_metadata } = session.user;
      const full_name = user_metadata?.full_name ?? '';

      // Insert user profile if not exists
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert([
          {
            id,
            full_name,
          },
        ]);

      if (insertError) {
        console.error('Error inserting profile:', insertError);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to error page if authentication fails
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

