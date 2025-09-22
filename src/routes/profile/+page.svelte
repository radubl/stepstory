<script lang="ts">
  import { user, createPlaylist, addVideoToPlaylist, userStore } from '$lib/stores/user.svelte.ts';
  import { videos } from '$lib/stores/videos.svelte.ts';
  import type { Video, Playlist } from '$lib/types/index';
  import { getDanceStyleSlug, getVideoSlug } from '$lib/utils/slugs';
  
  const favoriteVideos = $derived(
    user 
      ? user.favorites.map(id => videos.getById(id)).filter(Boolean) as Video[]
      : []
  );
  
  let selectedPlaylist = $state<Playlist | null>(null);
  let newPlaylistName = $state('');
  let newPlaylistDescription = $state('');
  let selectedParentPlaylist = $state('');
  
  function handleCreatePlaylist() {
    if (!newPlaylistName.trim()) return;
    
    const parentId = selectedParentPlaylist || undefined;
    createPlaylist(newPlaylistName, newPlaylistDescription, parentId);
    
    // Reset form
    newPlaylistName = '';
    newPlaylistDescription = '';
    selectedParentPlaylist = '';
  }
  
  function getPlaylistVideos(playlist: Playlist): Video[] {
    return playlist.videos.map(id => videos.getById(id)).filter(Boolean) as Video[];
  }
  
  function selectPlaylist(playlist: Playlist) {
    selectedPlaylist = selectedPlaylist?.id === playlist.id ? null : playlist;
  }
  
  // Using the store method directly
  
  // Using the store method directly
</script>

<svelte:head>
  <title>My Profile | StepStory</title>
</svelte:head>

{#if user}
  <div class="profile">
    <header class="profile-header">
      <h1>Welcome, {user.name}!</h1>
      <p class="email">{user.email}</p>
    </header>
    
    <div class="profile-grid">
      <section class="favorites-section">
        <h2>My Favorite Videos</h2>
        
        {#if favoriteVideos.length > 0}
          <div class="videos-list">
            {#each favoriteVideos as video}
              <a href="/{getDanceStyleSlug(video.danceStyleId)}/{getVideoSlug(video)}" class="video-item">
                <img src="https://img.youtube.com/vi/{video.youtubeId}/mqdefault.jpg" alt={video.title} />
                <div class="video-details">
                  <h3>{video.title}</h3>
                  <p class="video-meta">
                    <span class="dance-style">
                      {videos.find(v => v.danceStyleId === video.danceStyleId)?.title || 'Unknown Dance'}
                    </span>
                    <span class="difficulty">Level {video.difficulty}</span>
                  </p>
                </div>
              </a>
            {/each}
          </div>
        {:else}
          <p class="no-items">You haven't added any videos to your favorites yet.</p>
        {/if}
      </section>
      
      <section class="playlists-section">
        <h2>My Playlists</h2>
        
        <div class="create-playlist">
          <h3>Create New Playlist</h3>
          <div class="form-group">
            <label for="playlist-name">Playlist Name</label>
            <input 
              type="text" 
              id="playlist-name" 
              bind:value={newPlaylistName} 
              placeholder="Enter playlist name"
            />
          </div>
          
          <div class="form-group">
            <label for="playlist-description">Description (optional)</label>
            <textarea 
              id="playlist-description" 
              bind:value={newPlaylistDescription} 
              placeholder="Enter playlist description"
              rows="3"
            ></textarea>
          </div>
          
          {#if user.playlists.length > 0}
            <div class="form-group">
              <label for="parent-playlist">Parent Playlist (optional)</label>
              <select id="parent-playlist" bind:value={selectedParentPlaylist}>
                <option value="">None (Root Playlist)</option>
                {#each user.playlists as playlist}
                  <option value={playlist.id}>{playlist.name}</option>
                {/each}
              </select>
            </div>
          {/if}
          
          <button on:click={handleCreatePlaylist} class="create-btn">
            Create Playlist
          </button>
        </div>
        
        {#if user.playlists.length > 0}
          <div class="playlists-tree">
            <h3>My Playlists</h3>
            
            <ul class="playlist-root">
              {#each userStore.getRootPlaylists() as playlist}
                <li class="playlist-item" class:active={selectedPlaylist?.id === playlist.id}>
                  <div class="playlist-header" on:click={() => selectPlaylist(playlist)}>
                    <span class="playlist-name">{playlist.name}</span>
                    <span class="video-count">{playlist.videos.length} videos</span>
                  </div>
                  
                  {#if selectedPlaylist?.id === playlist.id}
                    <div class="playlist-content">
                      {#if playlist.description}
                        <p class="playlist-description">{playlist.description}</p>
                      {/if}
                      
                      {#if playlist.videos.length > 0}
                        <div class="playlist-videos">
                          {#each getPlaylistVideos(playlist) as video}
                            <a href="/{getDanceStyleSlug(video.danceStyleId)}/{getVideoSlug(video)}" class="playlist-video">
                              <img src="https://img.youtube.com/vi/{video.youtubeId}/mqdefault.jpg" alt={video.title} />
                              <div class="video-details">
                                <h4>{video.title}</h4>
                              </div>
                            </a>
                          {/each}
                        </div>
                      {:else}
                        <p class="no-items">No videos in this playlist yet.</p>
                      {/if}
                    </div>
                  {/if}
                  
                  {#if userStore.getChildPlaylists(playlist.id).length > 0}
                    <ul class="playlist-children">
                      {#each userStore.getChildPlaylists(playlist.id) as childPlaylist}
                        <li class="playlist-item" class:active={selectedPlaylist?.id === childPlaylist.id}>
                          <div class="playlist-header" on:click={() => selectPlaylist(childPlaylist)}>
                            <span class="playlist-name">{childPlaylist.name}</span>
                            <span class="video-count">{childPlaylist.videos.length} videos</span>
                          </div>
                          
                          {#if selectedPlaylist?.id === childPlaylist.id}
                            <div class="playlist-content">
                              {#if childPlaylist.description}
                                <p class="playlist-description">{childPlaylist.description}</p>
                              {/if}
                              
                              {#if childPlaylist.videos.length > 0}
                                <div class="playlist-videos">
                                  {#each getPlaylistVideos(childPlaylist) as video}
                                    <a href="/{getDanceStyleSlug(video.danceStyleId)}/{getVideoSlug(video)}" class="playlist-video">
                                      <img src="https://img.youtube.com/vi/{video.youtubeId}/mqdefault.jpg" alt={video.title} />
                                      <div class="video-details">
                                        <h4>{video.title}</h4>
                                      </div>
                                    </a>
                                  {/each}
                                </div>
                              {:else}
                                <p class="no-items">No videos in this playlist yet.</p>
                              {/if}
                            </div>
                          {/if}
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {:else}
          <p class="no-items">You haven't created any playlists yet.</p>
        {/if}
      </section>
    </div>
  </div>
{:else}
  <div class="login-prompt">
    <h1>Sign In Required</h1>
    <p>Please sign in to view your profile and manage your dance tutorials.</p>
    <button class="sign-in-btn">Sign In</button>
  </div>
{/if}

<style>
  .profile {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .profile-header {
    margin-bottom: 2rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
  }
  
  .profile-header h1 {
    margin-bottom: 0.25rem;
  }
  
  .email {
    color: #666;
  }
  
  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  h2 {
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  h3 {
    margin-bottom: 1rem;
  }
  
  .videos-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .video-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .video-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .video-item img {
    width: 120px;
    height: 68px;
    object-fit: cover;
    border-radius: 0.25rem;
  }
  
  .video-details {
    flex-grow: 1;
  }
  
  .video-details h3 {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  .video-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #666;
  }
  
  .create-playlist {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 0.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
  }
  
  .create-btn {
    padding: 0.75rem 1.5rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-weight: bold;
  }
  
  .create-btn:hover {
    background-color: #388e3c;
  }
  
  .playlists-tree {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
  }
  
  .playlist-root {
    list-style: none;
    padding: 0;
  }
  
  .playlist-children {
    list-style: none;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
  }
  
  .playlist-item {
    margin-bottom: 0.5rem;
  }
  
  .playlist-header {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background-color: #f5f5f5;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .playlist-item.active .playlist-header {
    background-color: #e8f5e9;
    border-left: 3px solid #4caf50;
  }
  
  .video-count {
    font-size: 0.85rem;
    color: #666;
  }
  
  .playlist-content {
    padding: 1rem;
    margin-top: 0.5rem;
    background-color: #f9f9f9;
    border-radius: 0.25rem;
  }
  
  .playlist-description {
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #666;
  }
  
  .playlist-videos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .playlist-video {
    text-decoration: none;
    color: inherit;
  }
  
  .playlist-video img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
  }
  
  .playlist-video h4 {
    font-size: 0.9rem;
    margin: 0;
  }
  
  .no-items {
    padding: 2rem;
    text-align: center;
    color: #666;
    background-color: #f9f9f9;
    border-radius: 0.5rem;
  }
  
  .login-prompt {
    max-width: 500px;
    margin: 5rem auto;
    padding: 3rem;
    text-align: center;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .sign-in-btn {
    margin-top: 1.5rem;
    padding: 0.75rem 2rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    .profile {
      padding: 1rem;
    }
    
    .profile-grid {
      grid-template-columns: 1fr;
    }
  }
</style>