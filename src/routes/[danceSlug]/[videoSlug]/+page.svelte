<script lang="ts">
  import { page } from '$app/stores';
  import { videos } from '$lib/stores/videos.svelte.ts';
  import { danceStyles } from '$lib/stores/danceStyles.svelte.ts';
  import { user, addToFavorites, removeFromFavorites, voteVideo } from '$lib/stores/user.svelte.ts';
  import { getDanceStyleBySlug, getVideoBySlug, getDanceStyleSlug, getVideoSlug } from '$lib/utils/slugs';
  import VideoPlayer from '$components/video-player/VideoPlayer.svelte';
  import TempoIndicator from '$components/tempo-indicator/TempoIndicator.svelte';
  import SyncedInstructions from '$components/instructions/SyncedInstructions.svelte';
  import type { Video, TempoSettings } from '$lib/types/index';
  
  // Get the dance style and video from slugs
  const danceSlug = $derived($page.params.danceSlug);
  const videoSlug = $derived($page.params.videoSlug);
  
  // Find the dance style from the slug
  const danceStyle = $derived(getDanceStyleBySlug(danceSlug));
  // Use the dance style ID to look up the video
  const video = $derived(
    danceStyle 
      ? getVideoBySlug(danceStyle.id, videoSlug) 
      : undefined
  );
  
  // Player state
  let player = $state<any>(null);
  let playerReady = $state(false);
  
  // User interaction state
  const isFavorite = $derived(
    video && user?.favorites.includes(video.id) || false
  );
  
  const hasVoted = $derived(
    video && user?.votedVideos[video.id] || false
  );
  
  // Create tempo settings based on dance style
  const tempoSettings = $derived(getTempoSettings(danceStyle?.id));
  
  function getTempoSettings(danceStyleId?: string): TempoSettings {
    if (danceStyleId === '1') { // Bachata
      return {
        type: 'bachata',
        count: 8,
        beats: [1, 2, 3, 4, 5, 6, 7, 8]
      };
    } else if (danceStyleId === '2') { // Salsa
      return {
        type: 'salsa',
        count: 8,
        beats: [1, 2, 3, 5, 6, 7]
      };
    } else {
      return {
        type: 'other',
        count: 4,
        beats: [1, 2, 3, 4]
      };
    }
  }
  
  function toggleFavorite() {
    if (video) {
      if (isFavorite) {
        removeFromFavorites(video.id);
      } else {
        addToFavorites(video.id);
      }
    }
  }
  
  function toggleVote() {
    if (video) {
      voteVideo(video.id, !hasVoted);
    }
  }
  
  function onPlayerReady(ytPlayer: any) {
    player = ytPlayer;
    playerReady = true;
  }
</script>

<svelte:head>
  <title>{video?.title || 'Video'} | StepStory</title>
</svelte:head>

{#if video}
  <article class="video-page">
    <header>
      <h1>{video.title}</h1>
      <div class="video-meta">
        <span class="dance-style">{danceStyle?.name || 'Unknown Dance'}</span>
        <span class="difficulty">Difficulty: {video.difficulty}/5</span>
        <span class="popularity">Popularity: {video.popularity.toFixed(1)}</span>
      </div>
      <div class="video-actions">
        <button on:click={toggleFavorite} class:active={isFavorite}>
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
        <button on:click={toggleVote} class:active={hasVoted}>
          {hasVoted ? 'Voted' : 'Vote for this Video'}
        </button>
      </div>
    </header>
    
    <section class="video-section">
      <VideoPlayer 
        youtubeId={video.youtubeId} 
        breakpoints={video.breakpoints || []}
        bind:player
        bind:playerReady
      />
      
      <TempoIndicator 
        tempoSettings={tempoSettings}
        {player}
        {playerReady}
      />
    </section>
    
    {#if video.instructions}
      <section class="instructions-section">
        <SyncedInstructions 
          instructions={video.instructions}
          {player}
          {playerReady}
        />
      </section>
    {/if}
    
    <section class="video-info">
      <div class="video-description">
        <h2>Description</h2>
        <p>{video.description}</p>
      </div>
      
      <div class="video-creator">
        <h2>Creator</h2>
        <p>
          <strong>{video.creator.name}</strong>
          {#if video.creator.danceSchool}
            <br />
            <span>School: {video.creator.danceSchool}</span>
          {/if}
          {#if video.creator.youtubeChannel}
            <br />
            <a href={video.creator.youtubeChannel} target="_blank" rel="noopener noreferrer">
              YouTube Channel
            </a>
          {/if}
        </p>
      </div>
      
      {#if video.tags && video.tags.length > 0}
        <div class="video-tags">
          <h2>Tags</h2>
          <div class="tag-list">
            {#each video.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>
        </div>
      {/if}
    </section>
  </article>
{:else}
  <div class="error">
    <h1>Video Not Found</h1>
    <p>Sorry, the video you're looking for doesn't exist or has been removed.</p>
  </div>
{/if}

<style>
  .video-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2.5rem;
  }
  
  header {
    margin-bottom: 3rem;
  }
  
  h1 {
    margin-bottom: 1rem;
    font-size: 2.5rem;
    background: linear-gradient(90deg, var(--text-color), var(--text-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.05em;
  }
  
  .video-meta {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    color: var(--text-light);
    font-size: 1.1rem;
    flex-wrap: wrap;
  }
  
  .video-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .video-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    background-color: var(--background-elevated);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--text-color);
    font-weight: 500;
    box-shadow: var(--box-shadow);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
  }
  
  button:hover {
    background-color: var(--card-background);
    transform: translateY(-3px);
    box-shadow: var(--hover-shadow);
  }
  
  button.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-dark);
  }
  
  .video-section, .instructions-section {
    margin-bottom: 3rem;
  }
  
  .video-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    background-color: var(--background-elevated);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: var(--box-shadow);
    border: 1px solid var(--border-color);
  }
  
  .video-info h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--text-color);
    font-size: 1.5rem;
    position: relative;
    display: inline-block;
  }
  
  .video-info h2::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -5px;
    width: 50px;
    height: 2px;
    background: linear-gradient(90deg, var(--primary-light), var(--secondary-color));
    border-radius: 2px;
  }
  
  .video-info p {
    color: var(--text-light);
    line-height: 1.7;
    margin-bottom: 0;
  }
  
  .video-description, .video-creator {
    padding: 0.5rem;
  }
  
  .video-creator a {
    display: inline-block;
    margin-top: 0.75rem;
    color: var(--accent-color);
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .video-creator a:hover {
    color: var(--primary-light);
    transform: translateX(3px);
  }
  
  .video-tags {
    grid-column: 1 / -1;
    border-top: 1px solid var(--divider-color);
    padding-top: 1.5rem;
    margin-top: 1rem;
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  .tag {
    padding: 0.35rem 1rem;
    background-color: var(--background-light);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    font-size: 0.9rem;
    color: var(--text-light);
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .tag:hover {
    background-color: var(--card-background);
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .error {
    text-align: center;
    padding: 4rem 2rem;
    background-color: var(--background-elevated);
    border-radius: 12px;
    box-shadow: var(--box-shadow);
    border: 1px solid var(--border-color);
    max-width: 600px;
    margin: 3rem auto;
  }
  
  .error h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--error-color);
  }
  
  .error p {
    color: var(--text-light);
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    .video-page {
      padding: 1.5rem;
    }
    
    .video-info {
      grid-template-columns: 1fr;
      padding: 1.5rem;
    }
    
    h1 {
      font-size: 2rem;
    }
    
    .video-meta {
      gap: 1rem;
      font-size: 1rem;
    }
    
    .video-actions {
      gap: 0.75rem;
    }
    
    button {
      padding: 0.6rem 1.25rem;
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 480px) {
    .video-page {
      padding: 1rem;
    }
    
    header {
      margin-bottom: 2rem;
    }
    
    h1 {
      font-size: 1.75rem;
    }
    
    .video-info {
      padding: 1.25rem;
    }
  }
</style>