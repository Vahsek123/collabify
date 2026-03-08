export interface Room {
  id: string;
  name: string;
  inviteCode: string;
  status: 'active' | 'closed';
  voteThreshold: number;
  ownerId: string;
  spotifyPlaylistId: string | null;
  spotifyPlaylistUrl: string | null;
  ownerName: string;
}

export interface Song {
  id: string;
  room_id: string;
  suggested_by: string;
  spotify_track_id: string;
  title: string;
  artist: string;
  album_art_url: string | null;
  preview_url: string | null;
  duration_ms: number | null;
  status: 'pending' | 'promoted' | 'rejected' | 'pushed';
  net_votes: number;
  created_at: string;
}

export interface Member {
  userId: string;
  joinedAt: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface CurrentUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}
