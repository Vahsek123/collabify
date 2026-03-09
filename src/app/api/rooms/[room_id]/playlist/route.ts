// app/api/playlist/route.ts
import { NextResponse } from 'next/server';
import { getValidSpotifyToken } from '@/lib/spotify/token';
import { createPlaylist, addTracksToPlaylist } from '@/lib/spotify/api';
import { getRouteSession } from '@/lib/dal';
import { AppError, handleRouteError, ok } from '@/lib/api';

interface PushPlaylistResponse {
  success: boolean;
  playlist_id: string;
  playlist_url: string;
  tracks_pushed: number;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ room_id: string }> },
): Promise<NextResponse> {
  try {
    const { user, supabase } = await getRouteSession();

    const { room_id } = await params;

    const { accessToken } = await getValidSpotifyToken();

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, name, owner_id, spotify_playlist_id, spotify_playlist_url')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      throw new AppError('Room not found.', 404);
    }

    if (room.owner_id !== user.id) {
      throw new AppError('Only the room owner can push to the playlist.', 403);
    }

    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('id, spotify_track_id')
      .eq('room_id', room_id)
      .eq('status', 'promoted');

    if (songsError) {
      console.error(
        '[api/playlist] Failed to fetch promoted songs:',
        songsError.message,
      );
      throw new AppError('Failed to fetch songs.', 500);
    }

    if (!songs || songs.length === 0) {
      throw new AppError('No promoted songs to push.', 422);
    }

    let playlistId = room.spotify_playlist_id;
    let playlistUrl = room.spotify_playlist_url;

    if (!playlistId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('spotify_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.spotify_id) {
        throw new AppError(
          'Spotify profile not found — user must re-authenticate.',
          400,
        );
      }

      const playlist = await createPlaylist(room.name, accessToken);

      playlistId = playlist.id;
      playlistUrl = playlist.external_urls.spotify;

      const { error: roomUpdateError } = await supabase
        .from('rooms')
        .update({
          spotify_playlist_id: playlistId,
          spotify_playlist_url: playlistUrl,
        })
        .eq('id', room_id);

      if (roomUpdateError) {
        // Non-fatal for this request but will cause duplicate playlist on retry.
        // Log loudly so this is caught in monitoring.
        console.error(
          '[api/playlist] WARN: Playlist created but failed to persist ID to room:',
          roomUpdateError.message,
        );
      }
    }

    const trackUris = songs.map((s) => `spotify:track:${s.spotify_track_id}`);
    await addTracksToPlaylist(playlistId, trackUris, accessToken);

    const songIds = songs.map((s) => s.id);
    const { error: statusUpdateError } = await supabase
      .from('songs')
      .update({ status: 'pushed' })
      .in('id', songIds);

    if (statusUpdateError) {
      // Tracks are in Spotify but still show as 'promoted' in DB.
      // A retry will attempt to re-add them — Spotify allows duplicates,
      // so manual cleanup or a dedup pass may be needed.
      console.error(
        '[api/playlist] WARN: Spotify push succeeded but song status update failed:',
        statusUpdateError.message,
        '| Affected song IDs:',
        songIds,
      );
    }

    const response: PushPlaylistResponse = {
      success: true,
      playlist_id: playlistId,
      playlist_url: playlistUrl!,
      tracks_pushed: songs.length,
    };

    return ok(response);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function GET({
  params,
}: {
  params: Promise<{ room_id: string }>;
}) {
  try {
    const { supabase } = await getRouteSession();

    const { room_id } = await params;

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('spotify_playlist_url')
      .eq('id', room_id)
      .single();

    if (!room || roomError) {
      throw new AppError('Room not found.', 404);
    }

    return ok({
      url: room.spotify_playlist_url,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
