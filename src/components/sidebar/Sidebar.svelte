<script lang="ts">
  import { danceStyles } from '$lib/stores/danceStyles.svelte.ts';
  import { userStore } from '$lib/stores/user.svelte.ts';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getDanceStyleSlug, getPlaylistSlug } from '$lib/utils/slugs';
  
  let { isExpanded = true } = $props();
  let expandedState = $state(isExpanded);
  
  // Sync with prop changes and initialize as expanded
  $effect(() => {
    expandedState = isExpanded;
  });
  
  // Initialize as expanded
  expandedState = true;
  
  function toggleSidebar() {
    expandedState = !expandedState;
  }
  
  let mounted = $state(false);
  
  onMount(() => {
    mounted = true;
  });
  
  function isActivePath(path: string): boolean {
    if (!$page?.url?.pathname) return false;
    if (path === '/') {
      return $page.url.pathname === '/';
    }
    return $page.url.pathname.startsWith(path);
  }
</script>

<aside class="sidebar {expandedState ? 'expanded' : 'collapsed'}">
  <div class="sidebar-header">
    <button class="toggle-button" on:click={toggleSidebar} aria-label={expandedState ? 'Collapse sidebar' : 'Expand sidebar'}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {#if expandedState}
          <polyline points="15 18 9 12 15 6"></polyline>
        {:else}
          <polyline points="9 18 15 12 9 6"></polyline>
        {/if}
      </svg>
    </button>
  </div>
  
  <div class="sidebar-content">
    <div class="sidebar-section">
      <h3 class="sidebar-heading">Dance Styles</h3>
      <ul class="sidebar-list">
        {#if danceStyles && typeof danceStyles.getAll === 'function'}
          {#each danceStyles.getAll() as style}
            <li>
              <a 
                href="/{getDanceStyleSlug(style)}" 
                class="sidebar-link {isActivePath(`/${getDanceStyleSlug(style)}`) ? 'active' : ''}"
              >
                <span class="icon">💃</span>
                {#if expandedState}
                  <span class="text">{style.name}</span>
                {/if}
              </a>
            </li>
          {/each}
        {/if}
        <li>
          <a 
            href="/" 
            class="sidebar-link view-all {isActivePath('/') && !$page.url.pathname.includes('/') ? 'active' : ''}"
          >
            <span class="icon">👁️</span>
            {#if expandedState}
              <span class="text">View All Styles</span>
            {/if}
          </a>
        </li>
      </ul>
    </div>
    
    {#if userStore?.currentUser}
      <div class="sidebar-section">
        <h3 class="sidebar-heading">My Playlists</h3>
        <ul class="sidebar-list">
          {#each userStore.currentUser?.playlists?.filter(p => !p.parentPlaylistId) || [] as playlist}
            <li>
              <a 
                href="/playlists/{getPlaylistSlug(playlist)}" 
                class="sidebar-link {isActivePath(`/playlists/${getPlaylistSlug(playlist)}`) ? 'active' : ''}"
              >
                <span class="icon">🎵</span>
                {#if expandedState}
                  <span class="text">{playlist.name}</span>
                {/if}
              </a>
            </li>
          {/each}
          <li>
            <a 
              href="/playlists" 
              class="sidebar-link view-all {isActivePath('/playlists') && !isActivePath('/playlists/') ? 'active' : ''}"
            >
              <span class="icon">👁️</span>
              {#if expandedState}
                <span class="text">View All Playlists</span>
              {/if}
            </a>
          </li>
        </ul>
      </div>
      
      <div class="sidebar-section">
        <h3 class="sidebar-heading">Favorites</h3>
        <a 
          href="/favorites" 
          class="sidebar-link {isActivePath('/favorites') ? 'active' : ''}"
        >
          <span class="icon">❤️</span>
          {#if expandedState}
            <span class="text">My Favorites ({userStore.currentUser?.favorites?.length || 0})</span>
          {/if}
        </a>
      </div>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    position: fixed;
    top: 80px;
    left: 0;
    height: calc(100vh - 80px);
    background-color: #1e1e1e;
    border-right: 1px solid #333333;
    transition: all 0.3s ease;
    z-index: 900;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
    overflow-y: auto;
    overflow-x: hidden;
    backdrop-filter: blur(10px);
    background-color: rgba(30, 30, 30, 0.8);
    max-width: 250px;
  }
  
  .expanded {
    width: 250px;
  }
  
  .collapsed {
    width: 60px;
  }
  
  .sidebar-header {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    border-bottom: 1px solid #333333;
  }
  
  .toggle-button {
    background: none;
    border: none;
    color: #b0b0b0;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
  
  .toggle-button:hover {
    background-color: rgba(187, 134, 252, 0.1);
    color: #bb86fc;
  }
  
  .sidebar-content {
    padding: 1rem 0;
    flex: 1;
  }
  
  .sidebar-section {
    margin-bottom: 1.5rem;
  }
  
  .sidebar-heading {
    font-size: 0.875rem;
    text-transform: uppercase;
    color: #b0b0b0;
    margin: 0;
    padding: 0 1rem 0.5rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }
  
  .collapsed .sidebar-heading {
    text-align: center;
    font-size: 0;
  }
  
  .sidebar-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .sidebar-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: #e1e1e1;
    text-decoration: none;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
  }
  
  .sidebar-link:hover {
    background-color: rgba(187, 134, 252, 0.05);
    color: #bb86fc;
    text-decoration: none;
  }
  
  .sidebar-link.active {
    background-color: rgba(187, 134, 252, 0.1);
    color: #bb86fc;
    border-left-color: #bb86fc;
  }
  
  .icon {
    font-size: 1.25rem;
    margin-right: 0.75rem;
    width: 1.5rem;
    text-align: center;
  }
  
  .collapsed .icon {
    margin-right: 0;
    margin-left: 0.2rem;
  }
  
  .text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .view-all {
    font-size: 0.875rem;
    color: #b0b0b0;
  }
  
  /* Hide text when collapsed */
  .collapsed .text {
    display: none;
  }
  
  /* Responsive adjustments */
  @media (max-width: 767px) {
    .sidebar {
      transform: translateX(-100%);
      width: 250px;
    }
    
    .sidebar.expanded {
      transform: translateX(0);
    }
    
    .collapsed {
      transform: translateX(-100%);
    }
  }
</style>