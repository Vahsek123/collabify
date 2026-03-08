'use client';
import { useState } from 'react';
import Image from 'next/image';

interface Song {
  id: string;
  title: string;
  artist: string;
  album_art_url: string | null;
  net_votes: number;
  spotify_track_id: string;
}

interface PromotedQueueProps {
  roomId: string;
  songs: Song[];
  playlistUrl: string | null;
  onPushed: () => void;
}

export default function PromotedQueue({
  roomId,
  songs,
  playlistUrl,
  onPushed,
}: PromotedQueueProps) {
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushed, setPushed] = useState(false);

  async function handlePush() {
    if (songs.length === 0) return;
    setPushing(true);
    setError(null);
    setPushed(false);

    try {
      const res = await fetch(`/api/rooms/${roomId}/push`, {
        method: 'POST',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to push songs.');
      }
      setPushed(true);
      onPushed();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#F5A623]/20 bg-[#F5A623]/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F5A623]/10 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M6.5 10V3M3.5 6L6.5 3L9.5 6"
              stroke="#F5A623"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-sans text-[12px] font-medium tracking-[0.05em] text-[#F5A623] uppercase">
            Promoted queue
          </span>
          {songs.length > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F5A623] font-sans text-[11px] font-medium text-[#0A0A0A]">
              {songs.length}
            </span>
          )}
        </div>
        {playlistUrl && (
          <a
            href={playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-sans text-[11px] font-normal text-white/30 transition-colors duration-150 hover:text-white/60"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 0C2.24 0 0 2.24 0 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm2.3 7.22c-.1.15-.28.2-.43.1-1.17-.72-2.65-.88-4.4-.47-.17.05-.32-.07-.37-.22-.05-.18.07-.33.23-.37 1.9-.43 3.55-.25 4.85.55.17.08.2.27.12.41zm.6-1.37c-.12.17-.35.25-.52.13-1.35-.82-3.4-1.07-4.97-.58-.2.05-.43-.05-.47-.25-.05-.2.05-.42.25-.47 1.81-.55 4.05-.28 5.59.67.15.08.22.33.12.5zm.05-1.4C6.35 3.5 3.68 3.4 2.15 3.88c-.25.07-.5-.08-.57-.3-.07-.25.08-.5.3-.57 1.77-.52 4.7-.42 6.55.67.22.12.3.42.17.65-.13.18-.43.25-.65.12z"
                fill="currentColor"
              />
            </svg>
            View playlist
          </a>
        )}
      </div>

      {/* Song list */}
      {songs.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="font-sans text-[12px] leading-relaxed font-light text-white/25">
            Songs that reach the vote threshold will appear here for you to push
            to Spotify.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F5A623]/8">
          {songs.map((song) => (
            <div key={song.id} className="flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-white/6">
                {song.album_art_url ? (
                  <Image
                    src={song.album_art_url}
                    width={32}
                    height={32}
                    alt={song.title}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs text-white/20">♪</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-[12px] font-medium text-white/80">
                  {song.title}
                </p>
                <p className="truncate font-sans text-[11px] font-light text-white/35">
                  {song.artist}
                </p>
              </div>
              <span className="shrink-0 font-serif text-[13px] text-[#F5A623]">
                +{song.net_votes}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Push button */}
      {songs.length > 0 && (
        <div className="border-t border-[#F5A623]/8 px-4 pt-3 pb-4">
          {error && (
            <p className="mb-3 font-sans text-[12px] font-light text-red-400">
              {error}
            </p>
          )}
          {pushed && (
            <p className="mb-3 font-sans text-[12px] font-light text-green-400">
              ✓ Songs pushed to Spotify playlist.
            </p>
          )}
          <button
            onClick={handlePush}
            disabled={pushing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] py-3 font-sans text-[13px] font-medium text-[#0A0A0A] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F7B740] hover:shadow-[0_8px_24px_rgba(245,166,35,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {pushing ? (
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
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6.5 1.5a5 5 0 015 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Pushing to Spotify…
              </>
            ) : (
              <>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="currentColor"
                >
                  <path d="M6.5 0C2.91 0 0 2.91 0 6.5S2.91 13 6.5 13 13 10.09 13 6.5 10.09 0 6.5 0zm2.99 9.38c-.13.2-.36.26-.56.13-1.54-.95-3.47-1.16-5.75-.63-.23.07-.43-.1-.49-.3-.07-.23.1-.43.3-.49 2.49-.57 4.64-.32 6.37.72.22.1.26.36.13.57zm.79-1.8c-.16.23-.46.32-.69.16-1.76-1.08-4.44-1.4-6.52-.76-.26.07-.55-.07-.62-.33-.07-.26.07-.55.33-.62 2.38-.72 5.33-.37 7.34.89.2.1.29.43.16.66zm.07-1.87c-2.11-1.25-5.59-1.37-7.61-.75-.32.1-.66-.1-.76-.42-.1-.32.1-.66.42-.76 2.31-.7 6.15-.56 8.57.87.29.16.39.53.23.82-.16.26-.53.36-.85.24z" />
                </svg>
                Push {songs.length} {songs.length === 1 ? 'song' : 'songs'} to
                Spotify
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
