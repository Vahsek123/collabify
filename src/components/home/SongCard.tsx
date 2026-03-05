type Song = {
  id: number;
  title: string;
  artist: string;
  votes: number;
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
      className={[
        'flex items-center gap-3.5 px-4 py-3 rounded-xl',
        'border transition-all duration-500',
        isActive
          ? 'bg-[#F5A623]/[0.08] border-[#F5A623]/30 translate-x-1'
          : 'bg-white/[0.04] border-white/[0.07] translate-x-0',
      ].join(' ')}
    >
      {/* Rank */}
      <span
        className={[
          'font-serif text-[11px] w-4 text-center flex-shrink-0 transition-colors duration-[400ms]',
          isActive ? 'text-[#F5A623]' : 'text-white/20',
        ].join(' ')}
      >
        {rank}
      </span>

      {/* Colour dot */}
      <div
        className={`w-8 h-8 rounded-lg flex-shrink-0 opacity-85 ${song.colour}`}
      />

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className="font-sans font-medium text-[13px] text-white/90 truncate">
          {song.title}
        </p>
        <p className="font-sans font-light text-[11px] text-white/40 mt-px">
          {song.artist}
        </p>
      </div>

      {/* Vote count */}
      <div className="flex flex-col items-center gap-[3px] flex-shrink-0">
        <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
          <path
            d="M5 0L10 7H0L5 0Z"
            fill={isActive ? '#F5A623' : 'rgba(255,255,255,0.25)'}
            className="transition-colors duration-[400ms]"
          />
        </svg>
        <span
          className={[
            'font-serif text-sm leading-none transition-colors duration-[400ms]',
            isActive ? 'text-[#F5A623]' : 'text-white/70',
          ].join(' ')}
        >
          {song.votes}
        </span>
      </div>
    </div>
  );
}
