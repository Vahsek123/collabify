'use client';

/**
 * app/dashboard/_components/SignOutButton.tsx
 *
 * Isolated client island for sign-out. Kept separate so the
 * rest of the dashboard remains a Server Component.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh(); // clear the server-side session cache
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-transparent px-4 py-2 font-sans text-sm font-normal text-white/40 transition-all duration-200 hover:border-white/20 hover:bg-white/4 hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <>
          <svg
            className="animate-spin"
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
          >
            <circle
              cx="6.5"
              cy="6.5"
              r="5"
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
            <path
              d="M6.5 1.5a5 5 0 015 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Signing out…
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M5 1H2a1 1 0 00-1 1v9a1 1 0 001 1h3M9 9.5L12 6.5M12 6.5L9 3.5M12 6.5H5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Sign out
        </>
      )}
    </button>
  );
}
