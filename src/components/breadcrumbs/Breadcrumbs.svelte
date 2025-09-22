<script lang="ts">
  import { page } from '$app/stores';
  import { danceStyles } from '$lib/stores/danceStyles.svelte';
  import { videos } from '$lib/stores/videos.svelte';
  import { userStore } from '$lib/stores/user.svelte';
  
  // Derived breadcrumb information based on the current path
  // Active path is directly from page store or fallback to /
  let path = '/';
  
  // Use in a reactive block to handle updates
  $: {
    if ($page?.url?.pathname) {
      path = $page.url.pathname;
    }
  }
  
  // Force breadcrumbs to show for development
  let segments = [
    { name: 'Home', path: '/' },
    { name: 'Current Page', path }
  ];
  
  // This would normally be a derived calculation, but for now we'll use simple defaults
    
    // Split the path into segments and remove empty segments
    const pathSegments = $page.url.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Start with home
    breadcrumbs.push({ name: 'Home', path: '/' });
    
    // Build up the path as we go
    let currentPath = '';
    
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;
      
      // Special handling for known routes
      if (segment === 'dances') {
        if (i === pathSegments.length - 1) {
          // This is the last segment, so it's the dances index page
          breadcrumbs.push({ name: 'Dance Styles', path: currentPath });
        }
        // If there's another segment after this, it's a dance style ID
        else if (pathSegments[i+1]) {
          breadcrumbs.push({ name: 'Dance Styles', path: currentPath });
          
          // Get the dance style name if available
          const styleId = pathSegments[i+1];
          const style = danceStyles.getById(styleId);
          
          if (style) {
            breadcrumbs.push({ 
              name: style.name, 
              path: `${currentPath}/${styleId}` 
            });
          } else {
            breadcrumbs.push({ 
              name: 'Style Details', 
              path: `${currentPath}/${styleId}` 
            });
          }
          
          // Skip the next iteration since we handled it
          i++;
          currentPath += `/${styleId}`;
        }
      }
      else if (segment === 'videos') {
        if (i === pathSegments.length - 1) {
          // This is the videos index page
          breadcrumbs.push({ name: 'Tutorials', path: currentPath });
        }
        // If there's another segment, it's a video ID
        else if (pathSegments[i+1]) {
          breadcrumbs.push({ name: 'Tutorials', path: currentPath });
          
          // Get the video title if available
          const videoId = pathSegments[i+1];
          const video = videos.getById(videoId);
          
          if (video) {
            breadcrumbs.push({ 
              name: video.title, 
              path: `${currentPath}/${videoId}` 
            });
          } else {
            breadcrumbs.push({ 
              name: 'Tutorial Details', 
              path: `${currentPath}/${videoId}` 
            });
          }
          
          // Skip the next iteration
          i++;
          currentPath += `/${videoId}`;
        }
      }
      else if (segment === 'playlists') {
        if (i === pathSegments.length - 1) {
          // This is the playlists index page
          breadcrumbs.push({ name: 'Playlists', path: currentPath });
        }
        // If there's another segment, it's a playlist ID
        else if (pathSegments[i+1]) {
          breadcrumbs.push({ name: 'Playlists', path: currentPath });
          
          // Get the playlist title if available
          const playlistId = pathSegments[i+1];
          const playlist = userStore.currentUser?.playlists.find(p => p.id === playlistId);
          
          if (playlist) {
            breadcrumbs.push({ 
              name: playlist.name, 
              path: `${currentPath}/${playlistId}` 
            });
          } else {
            breadcrumbs.push({ 
              name: 'Playlist Details', 
              path: `${currentPath}/${playlistId}` 
            });
          }
          
          // Skip the next iteration
          i++;
          currentPath += `/${playlistId}`;
        }
      }
      else if (segment === 'profile') {
        breadcrumbs.push({ name: 'My Profile', path: currentPath });
      }
      else if (segment === 'favorites') {
        breadcrumbs.push({ name: 'My Favorites', path: currentPath });
      }
      else {
        // Handle generic paths - convert to title case
        const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        breadcrumbs.push({ name, path: currentPath });
      }
    }
    
    return breadcrumbs;
  });
</script>

<nav aria-label="Breadcrumb" class="breadcrumbs" style="color: white; font-weight: bold;">
  <ol>
    {#each segments as segment, i}
      <li class="breadcrumb-item">
        {#if i < segments.length - 1}
          <a href={segment.path} class="breadcrumb-link">
            {#if segment.name === 'Home' && i === 0}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="home-icon">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            {:else}
              {segment.name}
            {/if}
          </a>
          <span class="separator">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
        {:else}
          <span class="current">{segment.name}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .breadcrumbs {
    padding: 0.5rem 0;
    color: #b0b0b0;
    font-size: 0.875rem;
    margin: 0;
  }
  
  ol {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    margin: 0;
    list-style: none;
    align-items: center;
  }
  
  .breadcrumb-item {
    display: flex;
    align-items: center;
  }
  
  .breadcrumb-link {
    color: #bb86fc;
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
    padding: 0 0.25rem;
    font-weight: 500;
  }
  
  .breadcrumb-link:hover {
    color: #bb86fc;
    text-shadow: 0 0 8px rgba(187,134,252,0.3);
  }
  
  .breadcrumb-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(187,134,252,0.3), transparent);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  .breadcrumb-link:hover::after {
    transform: scaleX(1);
  }
  
  .current {
    color: #e1e1e1;
    font-weight: 600;
    padding: 0 0.25rem;
    text-shadow: 0 0 6px rgba(255,255,255,0.1);
  }
  
  .separator {
    display: flex;
    align-items: center;
    color: #666666;
    margin: 0 0.25rem;
  }
  
  .home-icon {
    transition: all 0.2s ease;
    vertical-align: -3px;
    color: #bb86fc;
  }
  
  .breadcrumb-link:hover .home-icon {
    filter: drop-shadow(0 0 5px rgba(187,134,252,0.4));
    transform: scale(1.1);
  }
  
  @media (max-width: 767px) {
    .breadcrumbs {
      padding: 0.3rem 0;
      font-size: 0.75rem;
    }
    
    /* But show Home icon on mobile */
    .breadcrumb-item:first-child {
      display: flex;
    }
    
    /* Hide text elements on small screens */
    .breadcrumb-item:not(:first-child):not(:last-child) {
      display: none;
    }
    
    /* Keep last (current) item */
    .breadcrumb-item:last-child {
      display: flex;
    }
    
    /* Show arrow between home and current */
    .breadcrumb-item:first-child .separator {
      display: flex;
    }
  }
</style>