'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  albumArt: string | null;
  previewUrl: string | null;
  durationMs: number;
}

interface SongSearchProps {
  roomId: string;
  onSuggested: () => void; // callback to refresh song list
}

export default function SongSearch({ roomId, onSuggested }: SongSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [suggesting, setSuggesting] = useState<string | null>(null); // trackId being submitted
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search - 350ms after the user stops typing
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=6`,
        );
        if (!res.ok) throw new Error('Search failed.');
        const data = await res.json();
        setResults(data.tracks ?? []);
        setOpen(true);
      } catch {
        setError('Search failed. Try again.');
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSuggest(track: SpotifyTrack) {
    setSuggesting(track.id);
    setError(null);

    try {
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          spotifyTrackId: track.id,
          title: track.name,
          artist: track.artists,
          albumArtUrl: track.albumArt,
          previewUrl: track.previewUrl,
          durationMs: track.durationMs,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to suggest song.');
      }

      // Clear and close
      setQuery('');
      setResults([]);
      setOpen(false);
      onSuggested();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSuggesting(null);
    }
  }

  function formatDuration(ms: number) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="relative">
        <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-white/25">
          {searching ? (
            <svg
              className="animate-spin"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="7"
                cy="7"
                r="5.5"
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
              <path
                d="M7 1.5a5.5 5.5 0 015.5 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                cx="5.5"
                cy="5.5"
                r="4"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M8.5 8.5L12 12"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a song to suggest…"
          className="w-full rounded-xl border border-white/9 bg-white/4 py-3 pr-4 pl-9 font-sans text-[13px] font-normal text-[#F5F0E8] placeholder-white/20 transition-all duration-200 outline-none focus:border-[#F5A623]/40 focus:bg-white/6 focus:shadow-[0_0_0_3px_rgba(245,166,35,0.07)]"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 ml-1 font-sans text-[12px] font-light text-red-400">
          {error}
        </p>
      )}

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#141414] shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          {results.map((track, i) => (
            <button
              key={track.id}
              onClick={() => handleSuggest(track)}
              disabled={suggesting === track.id}
              className={[
                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-white/6 disabled:opacity-50',
                i > 0 ? 'border-t border-white/5' : '',
              ].join(' ')}
            >
              {/* Album art */}
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white/6">
                {track.albumArt ? (
                  <Image
                    src={track.albumArt}
                    width={36}
                    height={36}
                    alt={track.name}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs text-white/20">♪</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-[13px] font-medium text-white/85">
                  {track.name}
                </p>
                <p className="truncate font-sans text-[11px] font-light text-white/35">
                  {track.artists}
                </p>
              </div>

              {/* Duration + add icon */}
              <div className="flex shrink-0 items-center gap-2.5">
                <span className="font-sans text-[11px] font-light text-white/25">
                  {formatDuration(track.durationMs)}
                </span>
                {suggesting === track.id ? (
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="5.5"
                      stroke="rgba(245,166,35,0.3)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 1.5a5.5 5.5 0 015.5 5.5"
                      stroke="#F5A623"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#F5A623]/20 bg-[#F5A623]/10">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path
                        d="M4.5 1V8M1 4.5H8"
                        stroke="#F5A623"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
