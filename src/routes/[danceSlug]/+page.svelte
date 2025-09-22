<script lang="ts">
  import { page } from '$app/stores';
  import { danceStyles } from '$lib/stores/danceStyles.svelte.ts';
  import { videos } from '$lib/stores/videos.svelte.ts';
  import { getDanceStyleBySlug, getVideoSlug, getDanceStyleSlug } from '$lib/utils/slugs';
  import type { DanceStyle, Video } from '$lib/types/index';
  
  // Get the dance style from the slug
  const danceSlug = $derived($page.params.danceSlug);
  const danceStyle = $derived(getDanceStyleBySlug(danceSlug));
  const styleVideos = $derived(
    danceStyle 
      ? videos.getByDanceStyle(danceStyle.id)
      : []
  );
</script>

<svelte:head>
  <title>{danceStyle?.name || 'Dance Style'} | StepStory</title>
</svelte:head>

{#if danceStyle}
  <div class="dance-style">
    <header class="style-header" style="background-image: url({danceStyle.imageUrl || '/images/placeholder.jpg'})">
      <div class="header-content">
        <h1>{danceStyle.name}</h1>
        <p>{danceStyle.description}</p>
      </div>
    </header>
    
    <section class="videos-section">
      <h2>Tutorials for {danceStyle.name}</h2>
      
      {#if styleVideos.length > 0}
        <div class="filters">
          <div class="search">
            <input type="text" placeholder="Search tutorials..." />
          </div>
          <div class="filter-buttons">
            <button>All</button>
            <button>Beginner</button>
            <button>Intermediate</button>
            <button>Advanced</button>
          </div>
        </div>
        
        <div class="videos-grid">
          {#each styleVideos as video}
            <a href="/{getDanceStyleSlug(danceStyle)}/{getVideoSlug(video)}" class="video-card">
              <div class="video-thumbnail">
                <img src="https://img.youtube.com/vi/{video.youtubeId}/mqdefault.jpg" alt={video.title} />
                <span class="difficulty">Level {video.difficulty}</span>
              </div>
              <div class="video-info">
                <h3>{video.title}</h3>
                <p>{video.description.substring(0, 100)}...</p>
                <div class="video-meta">
                  <span class="creator">{video.creator.name}</span>
                  <span class="popularity">⭐ {video.popularity.toFixed(1)}</span>
                </div>
                {#if video.tags && video.tags.length > 0}
                  <div class="video-tags">
                    {#each video.tags.slice(0, 3) as tag}
                      <span class="tag">{tag}</span>
                    {/each}
                  </div>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      {:else}
        <div class="no-videos">
          <p>No tutorials available for this dance style yet.</p>
        </div>
      {/if}
    </section>
  </div>
{:else}
  <div class="error">
    <h1>Dance Style Not Found</h1>
    <p>Sorry, the dance style you're looking for doesn't exist or has been removed.</p>
  </div>
{/if}

<style>
  .dance-style {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .style-header {
    height: 300px;
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    align-items: flex-end;
    margin-bottom: 2rem;
  }
  
  .style-header::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4));
  }
  
  .header-content {
    padding: 2rem;
    color: white;
    position: relative;
    z-index: 1;
    width: 100%;
  }
  
  .header-content h1 {
    margin-bottom: 0.5rem;
    font-size: 2.5rem;
  }
  
  .videos-section {
    padding: 0 2rem 2rem;
  }
  
  .filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .search {
    flex-grow: 1;
    max-width: 400px;
  }
  
  .search input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
  }
  
  .filter-buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  .filter-buttons button {
    padding: 0.5rem 1rem;
    background-color: #f0f0f0;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .filter-buttons button:hover {
    background-color: #e0e0e0;
  }
  
  .videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }
  
  .video-card {
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    text-decoration: none;
    color: inherit;
    background-color: white;
  }
  
  .video-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .video-thumbnail {
    position: relative;
  }
  
  .video-thumbnail img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
  
  .difficulty {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
  }
  
  .video-info {
    padding: 1rem;
  }
  
  .video-info h3 {
    margin-bottom: 0.5rem;
  }
  
  .video-info p {
    color: #666;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .video-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    color: #666;
  }
  
  .video-tags {
    display: flex;
    gap: 0.5rem;
  }
  
  .tag {
    padding: 0.25rem 0.5rem;
    background-color: #f0f0f0;
    border-radius: 1rem;
    font-size: 0.8rem;
  }
  
  .no-videos, .error {
    text-align: center;
    padding: 3rem;
  }
  
  @media (max-width: 768px) {
    .style-header {
      height: 200px;
    }
    
    .header-content {
      padding: 1rem;
    }
    
    .videos-section {
      padding: 0 1rem 1rem;
    }
    
    .videos-grid {
      grid-template-columns: 1fr;
    }
    
    .filters {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search {
      max-width: none;
    }
  }
</style>