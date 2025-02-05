import { WorkOS } from '@workos-inc/node';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  console.log('Received code:', code);

  if (!code) {
    return redirect('/error?message=No_code_provided');
  }

  try {
    const { user } = await workos.passwordless.authenticateSession(code);
    
    console.log('Authenticated user:', user);

    if (!user) {
      console.error('No user data received from WorkOS');
      return redirect('/error?message=No_user_data');
    }

    // Create response headers with the cookie
    const response = new Response(null, {
      status: 302,
      headers: {
        'Location': '/dashboard',
        'Set-Cookie': `user=${JSON.stringify(user)}; Path=/; HttpOnly; ${
          process.env.NODE_ENV === 'production' ? 'Secure;' : ''
        } SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
      },
    });

    return response;

  } catch (error) {
    console.error('Full authentication error:', error);
    return redirect('/error?message=Authentication_failed');
  }
}