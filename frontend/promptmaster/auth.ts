import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import { authConfig } from './auth.config';

async function getUser(username: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE username=${username}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string().email(), password_hash: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password_hash } = parsedCredentials.data;

          const user = await getUser(username);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password_hash, user.password_hash);
          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
