'use client';

/**
 * app/dashboard/_components/CreateRoomDialog.tsx
 *
 * Client island for room creation. Handles the form state,
 * API call, and redirect on success.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateRoomDialog({
  open,
  onClose,
}: CreateRoomDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) {
      setError('Give your room a name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), voteThreshold: threshold }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create room.');
      }

      const { inviteCode } = await res.json();
      onClose();
      router.push(`/room/${inviteCode}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setName('');
    setThreshold(3);
    setError(null);
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div className="w-full max-w-[420px] rounded-2xl border border-white/[0.09] bg-[#141414] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="font-serif text-[22px] leading-tight tracking-[-0.02em] text-[#F5F0E8]">
                Create a room
              </h2>
              <p className="mt-1 font-sans text-[13px] font-light text-white/40">
                Your crew will join with an invite code.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white/30 transition-all duration-150 hover:bg-white/[0.06] hover:text-white/60"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1L11 11M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Room name */}
          <div className="mb-5">
            <label className="mb-2 block font-sans text-[12px] font-medium tracking-[0.06em] text-white/40 uppercase">
              Room name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Friday Night Vibes"
              maxLength={60}
              autoFocus
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-3 font-sans text-[14px] font-normal text-[#F5F0E8] placeholder-white/20 transition-all duration-200 outline-none focus:border-[#F5A623]/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(245,166,35,0.08)]"
            />
          </div>

          {/* Vote threshold */}
          <div className="mb-6">
            <label className="mb-2 block font-sans text-[12px] font-medium tracking-[0.06em] text-white/40 uppercase">
              Votes to promote a song
              <span className="ml-2 font-normal tracking-normal text-[#F5A623] normal-case">
                {threshold}
              </span>
            </label>
            <p className="mb-3 font-sans text-[12px] font-light text-white/25">
              How many net upvotes a song needs before it enters your promoted
              queue.
            </p>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 5, 8, 10].map((val) => (
                <button
                  key={val}
                  onClick={() => setThreshold(val)}
                  className={[
                    'flex-1 rounded-lg py-2 font-sans text-[13px] font-medium transition-all duration-150',
                    threshold === val
                      ? 'bg-[#F5A623] text-[#0A0A0A]'
                      : 'border border-white/[0.08] bg-white/[0.04] text-white/40 hover:border-white/20 hover:text-white/70',
                  ].join(' ')}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5">
              <p className="font-sans text-[13px] font-light text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-white/[0.08] bg-transparent py-3 font-sans text-[14px] font-normal text-white/40 transition-all duration-150 hover:border-white/20 hover:text-white/60 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="flex-1 rounded-xl bg-[#F5A623] py-3 font-sans text-[14px] font-medium text-[#0A0A0A] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F7B740] hover:shadow-[0_8px_24px_rgba(245,166,35,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? 'Creating…' : 'Create room'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
