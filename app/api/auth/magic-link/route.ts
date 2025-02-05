import { WorkOS } from '@workos-inc/node';
import { NextResponse } from 'next/server';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    console.log('Creating magic link session for:', email);

    // Create a passwordless session
    const session = await workos.passwordless.createSession({
      email,
      type: 'MagicLink',
    });
    console.log('Session created:', session.id);

    // Send the email via WorkOS
    await workos.passwordless.sendSession(session.id);
    console.log('Magic link email sent');

    return NextResponse.json({ 
      success: true, 
      message: 'Check your email for the magic link' 
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}