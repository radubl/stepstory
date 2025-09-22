export interface DanceStyle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  videos: string[]; // Array of video IDs
}

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  danceStyleId: string;
  creator: Creator;
  difficulty: number; // 1-5 scale
  popularity: number; // Calculated from votes
  tags: string[];
  breakpoints?: VideoBreakpoint[];
  instructions?: VideoInstructions;
}

export interface VideoBreakpoint {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  label?: string;
}

export interface VideoInstructions {
  steps: InstructionStep[];
}

export interface InstructionStep {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  leaderInstructions: string;
  followerInstructions: string;
}

export interface Creator {
  id: string;
  name: string;
  youtubeChannel?: string;
  website?: string;
  danceSchool?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  favorites: string[]; // Array of video IDs
  playlists: Playlist[];
  votedVideos: { [videoId: string]: boolean }; // Map of videoId to vote status
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videos: string[]; // Array of video IDs
  parentPlaylistId?: string; // For nested playlists
}

export interface TempoSettings {
  type: 'salsa' | 'bachata' | 'other';
  count: number; // e.g., 8 for 8-count
  beats: number[]; // e.g., [1, 2, 3, 5, 6, 7] for salsa
}