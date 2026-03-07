'use client';

/**
 * app/dashboard/_components/DashboardActions.tsx
 *
 * Client island housing the two primary dashboard actions:
 * - "Create a room" — opens the CreateRoomDialog
 * - "Join with code" — submits invite code and navigates
 *
 * Kept as a single island so only one "use client" boundary
 * is needed for both interactive elements.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateRoomDialog from './CreateRoomDialog';

export default function DashboardActions() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setJoining(true);
    setJoinError(null);

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: trimmed }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Invalid invite code.');
      }

      router.push(`/room/${trimmed}`);
    } catch (err: any) {
      setJoinError(err.message);
      setJoining(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Create room — primary CTA */}
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#F5A623] px-6 py-3.5 font-sans text-[14px] font-medium tracking-[-0.01em] text-[#0A0A0A] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F7B740] hover:shadow-[0_12px_32px_rgba(245,166,35,0.3)] active:translate-y-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1V13M1 7H13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Create a room
        </button>

        {/* Join with code — secondary */}
        <div className="flex flex-1 gap-2 sm:max-w-[280px]">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setJoinError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Enter invite code"
            maxLength={8}
            className={[
              'flex-1 rounded-xl border bg-white/[0.04] px-4 py-3 font-sans text-[14px] font-normal text-[#F5F0E8] placeholder-white/20 transition-all duration-200 outline-none',
              joinError
                ? 'border-red-500/30 focus:border-red-500/50'
                : 'border-white/[0.09] focus:border-[#F5A623]/40 focus:shadow-[0_0_0_3px_rgba(245,166,35,0.08)]',
            ].join(' ')}
          />
          <button
            onClick={handleJoin}
            disabled={joining || !code.trim()}
            className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-4 py-3 font-sans text-[13px] font-medium text-white/60 transition-all duration-150 hover:border-white/25 hover:bg-white/[0.08] hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {joining ? '…' : 'Join'}
          </button>
        </div>
      </div>

      {/* Inline join error */}
      {joinError && (
        <p className="mt-2 ml-0.5 font-sans text-[12px] font-light text-red-400">
          {joinError}
        </p>
      )}

      <CreateRoomDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
