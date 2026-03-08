import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

// Consistent error shape across all routes: { error: string }
export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  // Zod validation failure — surface the first issue clearly
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return err(`${first.path.join('.')}: ${first.message}`, 422);
  }

  // Known application errors thrown with a message
  if (error instanceof AppError) {
    return err(error.message, error.status);
  }

  // Unexpected — log server-side, return opaque message to client
  console.error('[API Error]', error);
  return err('An unexpected error occurred.', 500);
}

export class AppError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 32 chars, no 0/O/1/I/L
const CODE_LENGTH = 6;

export function generateInviteCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => ALPHABET[b % ALPHABET.length])
    .join('');
}
