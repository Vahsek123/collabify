import { RoomRow } from '@/types/dashboard';
import Link from 'next/link';

type RoomCardProps = {
  room: RoomRow;
  isOwner: boolean;
};

export default function RoomCard({ room, isOwner }: RoomCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(room.created_at));

  return (
    <Link
      href={`/room/${room.invite_code}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-white/3 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/6 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
    >
      {/* Top row: name + status */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-serif text-[18px] leading-tight tracking-[-0.02em] text-[#F5F0E8] transition-colors duration-200 group-hover:text-white">
          {room.name}
        </h3>
        <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <span className="font-sans text-[11px] font-medium tracking-[0.06em] text-green-500 uppercase">
            Live
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M9 4a3 3 0 11-6 0 3 3 0 016 0zM1 11a5 5 0 0110 0"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-sans text-[12px] font-light text-white/35">
            {room.memberCount} {room.memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1L7.5 4.5H11L8.25 6.75L9.25 10.5L6 8.25L2.75 10.5L3.75 6.75L1 4.5H4.5L6 1Z"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-sans text-[12px] font-light text-white/35">
            {room.pendingSongs} pending
          </span>
        </div>
        {room.promotedSongs > 0 && (
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 9V3M3 6L6 3L9 6"
                stroke="#F5A623"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-sans text-[12px] font-light text-[#F5A623]/70">
              {room.promotedSongs} promoted
            </span>
          </div>
        )}
      </div>

      {/* Footer: invite code + date */}
      <div className="flex items-center justify-between border-t border-white/6 pt-4">
        <div className="flex items-center gap-2">
          {isOwner && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#F5A623]/20 bg-[#F5A623]/10 px-2 py-1">
              <span className="font-sans text-[10px] font-medium tracking-[0.06em] text-[#F5A623] uppercase">
                Owner
              </span>
            </span>
          )}
          <span className="font-mono text-[12px] tracking-widest text-white/20">
            {room.invite_code}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans text-[11px] font-light text-white/20">
            {formattedDate}
          </span>
          {/* Hover reveal arrow */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#F5A623]"
          >
            <path
              d="M2 7H12M8 3L12 7L8 11"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
