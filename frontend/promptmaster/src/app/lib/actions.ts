// app/lib/actions.ts
'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { signIn } from 'next-auth/react';  // Adjusted NextAuth signIn import
import { AuthError } from 'next-auth';  // Use this for handling specific auth errors

// Define the form schema
const LoginSchema = z.object({
  username: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password_hash: z.string().min(6, {
    message: 'Password must be at least 6 characters',
  }),
});

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

// Helper function to generate a unique 6-character session code
function generateSessionCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

// Optional: Function to validate session code
export async function validateSessionCode(code: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id 
      FROM battle_sessions 
      WHERE session_code = ${code} 
      AND is_active = true
      AND current_players < max_players
      LIMIT 1
    `;
    return result.rows.length > 0;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

// Optional: Function to join session
export async function joinSession(code: string, userId: string) {
  try {
    await sql`
      UPDATE battle_sessions
      SET current_players = current_players + 1
      WHERE session_code = ${code}
      AND is_active = true
      AND current_players < max_players
    `;
    revalidatePath('/battle');
    redirect('/battle');
  } catch (error) {
    console.error('Join session error:', error);
    return 'Failed to join session';
  }
}