export interface RoomRow {
  id: string;
  name: string;
  invite_code: string;
  status: string;
  vote_threshold: number;
  created_at: string;
  owner_id: string;
  // aggregated below
  memberCount: number;
  pendingSongs: number;
  promotedSongs: number;
}
