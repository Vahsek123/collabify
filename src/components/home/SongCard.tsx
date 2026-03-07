import { cn } from '@/lib/utils';
import Image from 'next/image';

type Song = {
  id: number;
  title: string;
  artist: string;
  votes: number;
  cover: string;
  colour: string;
};

type SongCardProps = {
  song: Song;
  rank: number;
  isActive: boolean;
};

export default function SongCard({ song, rank, isActive }: SongCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3.5 rounded-xl px-4 py-3',
        'border transition-all duration-500',
        isActive
          ? 'translate-x-1 border-[#F5A623]/30 bg-[#F5A623]/8'
          : 'translate-x-0 border-white/[0.07] bg-white/4',
      )}
    >
      {/* Rank */}
      <span
        className={cn(
          'w-4 shrink-0 text-center font-serif text-[11px] transition-colors duration-400',
          isActive ? 'text-[#F5A623]' : 'text-white/20',
        )}
      >
        {rank}
      </span>

      {/* Colour dot */}
      <Image
        className={`outline-3 ${song.colour} rounded-lg`}
        src={song.cover}
        width={32}
        height={32}
        alt="album cover"
      />

      {/* Song info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-[13px] font-medium text-white/90">
          {song.title}
        </p>
        <p className="mt-px font-sans text-[11px] font-light text-white/40">
          {song.artist}
        </p>
      </div>

      {/* Vote count */}
      <div className="flex shrink-0 flex-col items-center gap-0.75">
        <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
          <path
            d="M5 0L10 7H0L5 0Z"
            fill={isActive ? '#F5A623' : 'rgba(255,255,255,0.25)'}
            className="transition-colors duration-400"
          />
        </svg>
        <span
          className={cn(
            'font-serif text-sm leading-none transition-colors duration-400',
            isActive ? 'text-[#F5A623]' : 'text-white/70',
          )}
        >
          {song.votes}
        </span>
      </div>
    </div>
  );
}
