'use client';
import { useState } from 'react';
import Image from 'next/image';
import SpotifyIcon from '../SpotifyIcon';
import Link from 'next/link';

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
      const res = await fetch(`/api/rooms/${roomId}/playlist`, {
        method: 'PUT',
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
          <Link
            href={playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-sans text-[11px] font-normal text-white/30 transition-colors duration-150 hover:text-white/60"
          >
            <SpotifyIcon size={12} />
            View playlist
          </Link>
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
                <SpotifyIcon size={16} />
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
