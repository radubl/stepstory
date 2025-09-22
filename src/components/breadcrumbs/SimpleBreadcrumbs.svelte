<script lang="ts">
  import { page } from '$app/stores';
  import { getDanceStyleBySlug, getVideoBySlug, getPlaylistBySlug } from '$lib/utils/slugs';
  
  // Get path segments for breadcrumbs
  let currentPath = $derived(() => {
    if (!$page || !$page.url || !$page.url.pathname) {
      return '/';
    }
    return $page.url.pathname;
  });
  
  // Create a name for the current page based on its type (dance style, video, playlist, etc.)
  let currentPageName = $derived(() => {
    if (currentPath === '/') {
      return 'Home';
    }
    
    // Get all segments
    const segments = currentPath.split('/').filter(Boolean);
    if (segments.length === 0) {
      return 'Home';
    }
    
    const lastSegment = segments[segments.length - 1];
    
    // Handle special cases: profile, favorites, playlists
    if (segments[0] === 'profile') {
      return 'My Profile';
    } else if (segments[0] === 'favorites') {
      return 'My Favorites';
    } else if (segments[0] === 'playlists') {
      if (segments.length === 1) {
        return 'Playlists';
      } else {
        // Try to get playlist by slug
        const playlist = getPlaylistBySlug(lastSegment);
        if (playlist) {
          return playlist.name;
        }
      }
    } else {
      // Might be a dance style or video
      const danceStyle = getDanceStyleBySlug(segments[0]);
      
      if (danceStyle) {
        if (segments.length === 1) {
          return danceStyle.name;
        } else if (segments.length === 2) {
          // This is likely a video under a dance style
          const video = getVideoBySlug(danceStyle.id, lastSegment);
          if (video) {
            return video.title;
          }
        }
      }
    }
    
    // Fallback: Convert slug to title case and replace hyphens
    return lastSegment
      .charAt(0).toUpperCase() 
      + lastSegment.slice(1).replace(/-/g, ' ');
  });
</script>

<nav class="breadcrumbs-nav">
  <div class="breadcrumbs-content">
    <a href="/" class="home-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </a>
    
    {#if currentPath !== '/'}
      <span class="separator">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </span>
      <span class="current-page">{currentPageName}</span>
    {/if}
  </div>
</nav>

<style>
  .breadcrumbs-nav {
    padding: 0.5rem 0;
    color: #b0b0b0;
    font-size: 1rem;
    width: 100%;
  }
  
  .breadcrumbs-content {
    display: flex;
    align-items: center;
  }
  
  .home-link {
    color: #bb86fc;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
    transform: scale(1.2);
  }
  
  .home-link:hover {
    filter: drop-shadow(0 0 5px rgba(187,134,252,0.4));
    transform: scale(1.1);
  }
  
  .separator {
    display: flex;
    align-items: center;
    color: #666666;
    margin: 0 0.5rem;
  }
  
  .current-page {
    color: #e1e1e1;
    font-weight: 600;
    font-size: 1.1rem;
    text-shadow: 0 0 8px rgba(187,134,252,0.3);
  }
</style>