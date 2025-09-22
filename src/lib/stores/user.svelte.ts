import type { User, Playlist } from '$lib/types';

// For development purposes, a mock user
const initialUser: User = {
  id: '1',
  name: 'Dance Enthusiast',
  email: 'dancer@example.com',
  favorites: ['1'],
  playlists: [
    {
      id: '1',
      name: 'My Favorite Bachata Moves',
      description: 'Collection of my favorite Bachata moves',
      videos: ['1', '2']
    }
  ],
  votedVideos: { '1': true }
};

class UserStore {
  currentUser = $state<User | null>({...initialUser});
  
  get user(): User | null {
    return this.currentUser;
  }
  
  set user(newUser: User | null) {
    this.currentUser = newUser;
  }
  
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
  
  addToFavorites(videoId: string) {
    if (!this.currentUser) return;
    
    if (!this.currentUser.favorites.includes(videoId)) {
      this.currentUser = {
        ...this.currentUser,
        favorites: [...this.currentUser.favorites, videoId]
      };
    }
  }
  
  removeFromFavorites(videoId: string) {
    if (!this.currentUser) return;
    
    this.currentUser = {
      ...this.currentUser,
      favorites: this.currentUser.favorites.filter(id => id !== videoId)
    };
  }
  
  createPlaylist(name: string, description?: string, parentPlaylistId?: string): string {
    if (!this.currentUser) return '';
    
    const newPlaylist = {
      id: Math.random().toString(36).substring(2, 9), // Simple random ID for demo
      name,
      description,
      videos: [],
      parentPlaylistId
    };
    
    this.currentUser = {
      ...this.currentUser,
      playlists: [...this.currentUser.playlists, newPlaylist]
    };
    
    return newPlaylist.id;
  }
  
  addVideoToPlaylist(playlistId: string, videoId: string) {
    if (!this.currentUser) return;
    
    this.currentUser = {
      ...this.currentUser,
      playlists: this.currentUser.playlists.map(playlist => {
        if (playlist.id === playlistId && !playlist.videos.includes(videoId)) {
          return { ...playlist, videos: [...playlist.videos, videoId] };
        }
        return playlist;
      })
    };
  }
  
  voteVideo(videoId: string, voted: boolean) {
    if (!this.currentUser) return;
    
    this.currentUser = { 
      ...this.currentUser, 
      votedVideos: { 
        ...this.currentUser.votedVideos, 
        [videoId]: voted 
      } 
    };
  }
  
  // Helper methods for playlists
  getPlaylistById(playlistId: string): Playlist | undefined {
    return this.currentUser?.playlists.find(p => p.id === playlistId);
  }
  
  getChildPlaylists(parentId: string): Playlist[] {
    return this.currentUser?.playlists.filter(p => p.parentPlaylistId === parentId) || [];
  }
  
  getRootPlaylists(): Playlist[] {
    return this.currentUser?.playlists.filter(p => !p.parentPlaylistId) || [];
  }
}

// Instantiate and export the store
export const userStore = new UserStore();
export const user = userStore.user;

// Export the methods
export const {
  addToFavorites, 
  removeFromFavorites, 
  createPlaylist, 
  addVideoToPlaylist, 
  voteVideo,
  getChildPlaylists,
  getRootPlaylists,
  getPlaylistById
} = userStore;