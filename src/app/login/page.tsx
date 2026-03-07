'use client';
/**
 * Login page
 * Handles:
 * - Spotify OAuth initiation via Supabase
 * - Error display from ?error= search param (set by app/auth/callback/route.ts)
 * - Loading state during OAuth redirect
 */

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import '@/styles/login.css';
import SpotifyIcon from '@/components/SpotifyIcon';
import Loading from '@/components/login/Loading';

type ErrorCode = 'auth_failed' | 'no_code' | 'access_denied' | 'default';

// Human-readable error messages mapped from OAuth error codes
const ERROR_MESSAGES = {
  auth_failed: 'Authentication failed. Please try again.',
  no_code: 'Something went wrong with the Spotify redirect. Please try again.',
  access_denied: 'Spotify access was denied. We need permission to continue.',
  default: 'Something went wrong. Please try again.',
};

function getErrorMessage(code: ErrorCode) {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.default;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error') as ErrorCode | null;
  const [loading, setLoading] = useState(false);

  async function handleSpotifyLogin() {
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        // Scopes: basic identity + playlist management for room owners.
        // All users get playlist scopes — we can't know at login time
        // who will become a room owner, so request upfront.
        scopes:
          'user-read-email user-read-private playlist-modify-public playlist-modify-private',
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      // signInWithOAuth redirects on success — if we're still here, it failed
      console.error('OAuth initiation error:', error);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0A0A0A]">
      {/* ── Grain overlay ── */}
      <div
        className={`bg-noise pointer-events-none absolute inset-0 z-1 bg-size-[256px] opacity-[0.035]`}
      />

      {/* ── Ambient glow — centred behind card ── */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-150 w-150 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(245,166,35,0.08)_0%,transparent_65%)]" />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-12 py-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-[22px] tracking-[-0.02em] text-[#F5F0E8] transition-opacity duration-200 hover:opacity-70"
        >
          <span className="text-[#F5A623]">♪</span> Collabify
        </Link>
      </nav>

      {/* ── Centred card ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-100 flex-col items-center text-center">
          {/* Icon mark */}
          <div className="animate-fade-up mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F5A623]/20 bg-[#F5A623]/10">
              <span className="font-serif text-3xl leading-none text-[#F5A623]">
                ♪
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-up mb-3 font-serif text-[38px] leading-[1.05] tracking-[-0.03em] text-[#F5F0E8] delay-1">
            Welcome to
            <br />
            <em className="text-[#F5A623] not-italic">Collabify</em>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-up mb-10 max-w-75 font-sans text-[15px] leading-relaxed font-light text-white/45 delay-2">
            Sign in with Spotify to create rooms, suggest tracks, and vote with
            your crew.
          </p>

          {/* Error state */}
          {errorCode && (
            <div className="animate-fade-up mb-6 flex w-full items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
              <svg
                className="mt-0.5 shrink-0"
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
              >
                <path
                  d="M7.5 1.5a6 6 0 100 12 6 6 0 000-12zM7.5 4.5v4M7.5 10h.01"
                  stroke="#F87171"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-left font-sans text-[13px] leading-relaxed font-light text-red-400">
                {getErrorMessage(errorCode)}
              </p>
            </div>
          )}

          {/* Spotify CTA — the entire purpose of this page */}
          <div className="animate-fade-up w-full delay-3">
            <button
              onClick={handleSpotifyLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#F5A623] px-6 py-4 font-sans text-[15px] font-medium tracking-[-0.01em] text-[#0A0A0A] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F7B740] hover:shadow-[0_16px_40px_rgba(245,166,35,0.3)] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  {/* Spinner */}
                  <Loading />
                  Connecting to Spotify…
                </>
              ) : (
                <>
                  <SpotifyIcon size={20} />
                  Continue with Spotify
                </>
              )}
            </button>
          </div>

          {/* Legal note */}
          <p className="animate-fade-up mt-6 max-w-70 font-sans text-[12px] leading-relaxed font-light text-white/20 delay-4">
            By continuing you agree to our Terms and Privacy Policy. Collabify
            is not affiliated with Spotify AB.
          </p>
        </div>
      </main>
    </div>
  );
}
