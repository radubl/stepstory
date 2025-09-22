<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/user.svelte.ts';
  import { danceStyles } from '$lib/stores/danceStyles.svelte.ts';
  import { videos } from '$lib/stores/videos.svelte.ts';
  import { getDanceStyleBySlug, getVideoBySlug, getDanceStyleSlug, getVideoSlug } from '$lib/utils/slugs';
  import Sidebar from '../components/sidebar/Sidebar.svelte';
  import SidebarTrigger from '../components/sidebar/SidebarTrigger.svelte';
  import SimpleBreadcrumbs from '../components/breadcrumbs/SimpleBreadcrumbs.svelte';
  
  let { children, data } = $props();
  
  let menuOpen = $state(false);
  let showSidebar = $state(false);

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  function isActivePath(path: string): boolean {
    if (path === '/') {
      return $page.url.pathname === '/';
    }
    return $page.url.pathname.startsWith(path);
  }

  // Handle responsive sidebar based on screen size
  $effect(() => {
    if (typeof window !== 'undefined') {
      // Set initial state based on screen size - start collapsed on all screen sizes
      showSidebar = false;

      // Handle window resize - keep sidebar collapsed unless manually toggled
      const handleResize = () => {
        // On mobile, always collapse sidebar for UX
        if (window.innerWidth < 768) {
          showSidebar = false;
        }
        // On desktop, maintain current state (don't auto-expand)
      };

      window.addEventListener('resize', handleResize);

      // Clean up event listener
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  });
  
  // Hide sidebar on mobile when navigating to a new page
  $effect(() => {
    const path = $page.url.pathname;
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      showSidebar = false;
    }
  });
</script>

<div class="flex flex-col min-h-screen max-w-full overflow-x-hidden">
  <header class="fixed top-0 left-0 right-0 h-[80px] bg-gradient-to-r from-[#121212]/95 via-[#1a1a1a]/95 to-[#121212]/95 shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-[1000] backdrop-blur-xl border-b border-[#333333]/50 w-full">
    <div class="w-full max-w-none px-6 md:px-10 lg:px-16 flex justify-between items-center h-full mx-auto">
      <a href="/" class="text-2xl md:text-3xl font-extrabold no-underline tracking-tight bg-gradient-to-r from-[#bb86fc] via-[#9d46ff] to-[#6200ea] bg-clip-text text-transparent transition-all duration-300 hover:scale-105 hover:no-underline">
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 filter drop-shadow-[0_0_8px_rgba(187,134,252,0.5)]"><defs><linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#bb86fc" /><stop offset="100%" stop-color="#03dac6" /></linearGradient></defs><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
          <span class="relative">
            StepStory
            <span class="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#bb86fc] via-[#03dac6] to-[#bb86fc] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </span>
        </span>
      </a>
      
      <button class="mobile-menu-button bg-[#1e1e1e]/80 border border-[#333333]/50 w-10 h-10 relative cursor-pointer z-[1001] p-2 rounded-md backdrop-blur-sm hover:bg-gradient-to-br hover:from-[#2d2d2d] hover:to-[#202020] hover:shadow-[0_0_10px_rgba(187,134,252,0.2)] transition-all duration-300" on:click={toggleMenu} aria-label="Toggle menu">
        <span class="block absolute h-0.5 w-6 bg-gradient-to-r from-[#bb86fc] to-[#03dac6] rounded-full top-[15px] transition-all duration-300
                   {menuOpen ? 'rotate-45 translate-y-[6px]' : ''} 
                   before:content-[''] before:block before:absolute before:h-0.5 before:w-6 before:bg-gradient-to-r before:from-[#bb86fc] before:to-[#03dac6] before:rounded-full before:top-[-6px] before:transition-all before:duration-300 
                   {menuOpen ? 'before:opacity-0' : ''}
                   after:content-[''] after:block after:absolute after:h-0.5 after:w-6 after:bg-gradient-to-r after:from-[#bb86fc] after:to-[#03dac6] after:rounded-full after:bottom-[-6px] after:transition-all after:duration-300
                   {menuOpen ? 'after:-rotate-45 after:translate-y-[-6px]' : ''}"></span>
      </button>
      
      <nav class="desktop-nav items-center justify-end flex-1 w-auto">
        <ul class="flex gap-8 md:gap-10 lg:gap-16 list-none m-0 p-0 ml-auto">
          <li class="relative">
            <a 
              href="/" 
              class="nav-link {isActivePath('/') ? 'active' : ''}"
              on:click={closeMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Home
            </a>
          </li>
          <li class="relative">
            <a 
              href="/" 
              class="nav-link {isActivePath('/') ? 'active' : ''}"
              on:click={closeMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="M5 12a7 7 0 0 0 14 0"></path></svg>
              Dance Styles
            </a>
          </li>
          <li class="relative">
            <a 
              href="/profile" 
              class="nav-link {isActivePath('/profile') ? 'active' : ''}"
              on:click={closeMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              My Profile
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
    <!-- Mobile menu overlay -->
    <div class="mobile-menu-overlay fixed inset-0 bg-[#121212]/95 z-[1000] transition-all duration-300 backdrop-blur-md {menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}">
      <div class="container h-full pt-24 pb-8">
        <ul class="flex flex-col gap-6 list-none m-0 p-0">
          <li class="relative">
            <a 
              href="/" 
              class="flex items-center text-2xl no-underline text-[#e1e1e1] font-medium py-3 px-0 transition-colors duration-300 hover:text-accent hover:no-underline {isActivePath('/') ? 'text-accent' : ''}"
              on:click={closeMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Home
            </a>
          </li>
          <li class="relative">
            <a 
              href="/" 
              class="flex items-center text-2xl no-underline text-[#e1e1e1] font-medium py-3 px-0 transition-colors duration-300 hover:text-accent hover:no-underline {isActivePath('/') ? 'text-accent' : ''}"
              on:click={closeMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="M5 12a7 7 0 0 0 14 0"></path></svg>
              Dance Styles
            </a>
          </li>
          <li class="relative">
            <a 
              href="/profile" 
              class="flex items-center text-2xl no-underline text-[#e1e1e1] font-medium py-3 px-0 transition-colors duration-300 hover:text-accent hover:no-underline {isActivePath('/profile') ? 'text-accent' : ''}"
              on:click={closeMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              My Profile
            </a>
          </li>
        </ul>
      </div>
    </div>
  </header>
  
  <!-- Sidebar -->
  <Sidebar isExpanded={showSidebar} />
  
  <!-- Mobile sidebar trigger -->
  <SidebarTrigger showSidebar={showSidebar} />
  
  <main class="content-area mt-[80px] min-h-[calc(100vh-80px)] w-full transition-all duration-300 overflow-x-hidden {showSidebar ? 'sidebar-expanded' : 'sidebar-collapsed'}">
    <div class="breadcrumb-container px-6 md:px-10 lg:px-16">
      <div class="breadcrumbs-nav">
        <div class="breadcrumbs-content">
          <!-- Home link -->
          <a href="/" class="home-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </a>
          
          {#if $page?.url?.pathname && $page.url.pathname !== '/'}
            <!-- Get path segments -->
            {@const segments = $page.url.pathname.split('/').filter(Boolean)}
            
            <!-- First segment: Dance Style Slug, Playlists, Profile, or Favorites -->
            {#if segments.length > 0}
              <span class="separator">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
              
              {#if segments[0] === 'playlists'}
                <a href="/playlists" class="breadcrumb-link">Playlists</a>
              {:else if segments[0] === 'profile'}
                <span class="current-page">My Profile</span>
              {:else if segments[0] === 'favorites'}
                <span class="current-page">My Favorites</span>
              {:else}
                <!-- Attempt to find dance style by slug -->
                {@const danceStyle = getDanceStyleBySlug(segments[0])}
                {#if danceStyle}
                  {#if segments.length === 1}
                    <span class="current-page">{danceStyle.name}</span>
                  {:else}
                    <a href="/{getDanceStyleSlug(danceStyle)}" class="breadcrumb-link">{danceStyle.name}</a>
                  {/if}
                {:else}
                  <span class="current-page">{segments[0].charAt(0).toUpperCase() + segments[0].slice(1).replace(/-/g, ' ')}</span>
                {/if}
              {/if}
            {/if}
            
            <!-- Second segment: Video -->
            {#if segments.length > 1}
              {@const danceStyle = getDanceStyleBySlug(segments[0])}
              {#if danceStyle}
                {@const video = getVideoBySlug(danceStyle.id, segments[1])}
                {#if video}
                  <span class="separator">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </span>
                  <span class="current-page">{video.title}</span>
                {/if}
              {/if}
            {/if}
            
            <!-- Second segment: Playlist details -->
            {#if segments[0] === 'playlists' && segments.length > 1}
              <span class="separator">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
              
              <!-- Playlist name -->
              {#if segments[1] === '1'}
                <span class="current-page">My Favorite Bachata Moves</span>
              {:else}
                <span class="current-page">Playlist</span>
              {/if}
            {/if}
          {/if}
        </div>
      </div>
    </div>
    {@render children()}
  </main>
  
  <footer class="footer bg-gradient-to-b from-[#121212] to-[#2d2d2d] py-16 pt-16 pb-8 mt-16 border-t border-[#333333]/50 relative overflow-hidden after:content-[''] after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyBmaWxsPSIjMjIyIiBmaWxsLW9wYWNpdHk9IjAuMTUiPjxwYXRoIGQ9Ik0wIDM4LjU5bDIuODMtMi44M2MxLjQxLTEuNDEgMy43LTEuNDEgNS4xMiAwTDkuOSAzNy43MmMxLjQxIDEuNDEgMS40MSAzLjcgMCA1LjEyTDcuMDcgNDUuNjhjLTEuNDEgMS40MS0zLjcgMS40MS01LjEyIDBMMCA0My43YzEuNDEtMS40MSAxLjQxLTMuNyAwLTUuMTJ6TTIwIDE4LjU5bDIuODMtMi44M2MxLjQxLTEuNDEgMy43LTEuNDEgNS4xMiAwTDI5LjkgMTcuNzJjMS40MSAxLjQxIDEuNDEgMy43IDAgNS4xMkwyNy4wNyAyNS42OGMtMS40MSAxLjQxLTMuNyAxLjQxLTUuMTIgMEwyMCAyMy43YzEuNDEtMS40MSAxLjQxLTMuNyAwLTUuMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] after:opacity-5 after:z-[-1] {showSidebar ? 'sidebar-expanded' : 'sidebar-collapsed'}">
    <div class="container">
      <div class="grid md:grid-cols-4 grid-cols-1 gap-12 mb-12">
        <div class="md:col-span-2">
          <a href="/" class="inline-block group relative">
            <h2 class="mt-0 mb-4 text-3xl font-extrabold bg-gradient-to-r from-[#bb86fc] via-[#9d46ff] to-[#03dac6] bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-all duration-300 origin-left">
              StepStory
              <span class="absolute inset-0 bg-gradient-to-r from-[#bb86fc]/10 to-[#03dac6]/10 blur-xl filter opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
            </h2>
          </a>
          <p class="text-[#b0b0b0] text-lg leading-relaxed">Learn dance through step-by-step tutorials</p>
          <div class="flex gap-4 mt-6">
            <a href="#" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e1e1e] text-[#e1e1e1] hover:bg-gradient-to-br hover:from-[#bb86fc] hover:to-[#6200ea] hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-[0_0_15px_rgba(98,0,234,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e1e1e] text-[#e1e1e1] hover:bg-gradient-to-br hover:from-[#bb86fc] hover:to-[#6200ea] hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-[0_0_15px_rgba(98,0,234,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e1e1e] text-[#e1e1e1] hover:bg-gradient-to-br hover:from-[#bb86fc] hover:to-[#6200ea] hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-[0_0_15px_rgba(98,0,234,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a href="#" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e1e1e] text-[#e1e1e1] hover:bg-gradient-to-br hover:from-[#bb86fc] hover:to-[#6200ea] hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-[0_0_15px_rgba(98,0,234,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>
        
        <div>
          <h3 class="mt-0 mb-5 text-xl font-bold relative inline-block">
            <span class="bg-gradient-to-r from-[#bb86fc] to-[#03dac6] bg-clip-text text-transparent">Quick Links</span>
            <span class="block mt-1 h-0.5 w-full bg-gradient-to-r from-[#bb86fc] to-[#03dac6] rounded-full transform origin-left"></span>
          </h3>
          <ul class="list-none p-0 m-0 space-y-3">
            <li><a href="/" class="footer-link">Home</a></li>
            <li><a href="/" class="footer-link">Dance Styles</a></li>
            <li><a href="/profile" class="footer-link">My Profile</a></li>
            <li><a href="/" class="footer-link">Browse Dance Styles</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="mt-0 mb-5 text-xl font-bold relative inline-block">
            <span class="bg-gradient-to-r from-[#bb86fc] to-[#03dac6] bg-clip-text text-transparent">Legal</span>
            <span class="block mt-1 h-0.5 w-full bg-gradient-to-r from-[#bb86fc] to-[#03dac6] rounded-full transform origin-left"></span>
          </h3>
          <ul class="list-none p-0 m-0 space-y-3">
            <li><a href="/terms" class="footer-link">Terms of Service</a></li>
            <li><a href="/privacy" class="footer-link">Privacy Policy</a></li>
            <li><a href="/cookies" class="footer-link">Cookie Policy</a></li>
            <li><a href="/about" class="footer-link">About Us</a></li>
          </ul>
        </div>
      </div>
      
      <div class="text-center text-sm pt-8 border-t border-[#333333]/30 relative">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#bb86fc]/20 to-transparent"></div>
        <p class="text-[#b0b0b0]">
          &copy; {new Date().getFullYear()} 
          <span class="bg-gradient-to-r from-[#bb86fc] to-[#03dac6] bg-clip-text text-transparent font-medium">StepStory</span>. 
          All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Header and Navigation */
  header {
    width: 100%;
    box-sizing: border-box;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-button {
    display: block;
  }
  
  .mobile-menu-overlay {
    display: block;
  }
  
  @media (min-width: 768px) {
    .desktop-nav {
      display: flex !important;
    }
    
    .mobile-menu-button {
      display: none !important;
    }
    
    .mobile-menu-overlay {
      display: none !important;
    }
  }
  
  /* Navigation Links */
  .nav-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #b0b0b0;
    font-weight: 500;
    padding: 0.75rem 1rem;
    position: relative;
    transition: all 0.3s ease;
    overflow: hidden;
    border-radius: 0.5rem;
  }
  
  .nav-link::before {
    content: '';
    position: absolute;
    left: -100%;
    bottom: 0;
    height: 2px;
    width: 100%;
    background: linear-gradient(90deg, #03dac6, #bb86fc, #9d46ff);
    transition: transform 0.4s cubic-bezier(0.86, 0, 0.07, 1);
    border-radius: 2px;
    z-index: 1;
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    right: -100%;
    bottom: 0;
    height: 2px;
    width: 100%;
    background: linear-gradient(90deg, #9d46ff, #bb86fc, #03dac6);
    transition: transform 0.4s cubic-bezier(0.86, 0, 0.07, 1);
    border-radius: 2px;
    z-index: 1;
  }
  
  .nav-link svg {
    filter: drop-shadow(0 0 3px rgba(187,134,252,0.2));
    transition: all 0.3s ease;
  }
  
  .nav-link:hover {
    color: #bb86fc;
    text-decoration: none;
    text-shadow: 0 0 8px rgba(187,134,252,0.3);
    background-color: rgba(187,134,252,0.05);
  }
  
  .nav-link:hover svg {
    filter: drop-shadow(0 0 5px rgba(187,134,252,0.4));
    transform: scale(1.1);
  }
  
  .nav-link:hover::before {
    transform: translateX(100%);
  }
  
  .nav-link:hover::after {
    transform: translateX(-100%);
  }
  
  .nav-link.active {
    color: #bb86fc;
    text-shadow: 0 0 8px rgba(187,134,252,0.3);
    background-color: rgba(187,134,252,0.1);
  }
  
  .nav-link.active svg {
    filter: drop-shadow(0 0 5px rgba(187,134,252,0.4));
  }
  
  .nav-link.active::before,
  .nav-link.active::after {
    transform: translateX(100%);
  }
  
  /* Content Area */
  .content-area {
    transition: padding-left 0.3s ease;
  }

  .content-area.sidebar-collapsed {
    padding-left: 60px;
  }

  .content-area.sidebar-expanded {
    padding-left: 250px;
  }
  
  .breadcrumb-container {
    background: linear-gradient(to bottom, rgba(30, 30, 30, 0.8) 0%, rgba(30, 30, 30, 0.6) 100%);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(187, 134, 252, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    margin: 0 0 1rem 0;
    padding: 0 16px;
    position: sticky;
    z-index: 50;
  }
  
  .breadcrumbs-nav {
    color: #b0b0b0;
    font-size: 1rem;
    width: 100%;
    padding: 0.75rem 0;
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
  
  .breadcrumb-link {
    color: #bb86fc;
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
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
  
  .current-page {
    color: #e1e1e1;
    font-weight: 600;
    font-size: 1.1rem;
    text-shadow: 0 0 8px rgba(187,134,252,0.3);
  }
  
  @media (max-width: 767px) {
    .content-area.sidebar-collapsed,
    .content-area.sidebar-expanded {
      padding-left: 0;
    }
  }
  
  .footer {
    transition: padding-left 0.3s ease;
    overflow-x: hidden;
    width: 100%;
    box-sizing: border-box;
  }

  .footer.sidebar-collapsed {
    padding-left: 60px;
  }

  .footer.sidebar-expanded {
    padding-left: 250px;
  }

  @media (max-width: 767px) {
    .footer.sidebar-collapsed,
    .footer.sidebar-expanded {
      padding-left: 0;
    }
  }
  
  /* Footer Links */
  .footer-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #b0b0b0;
    transition: all 0.3s ease;
    font-weight: 500;
    position: relative;
    padding: 0.25rem 0;
    overflow: hidden;
  }
  
  .footer-link::before {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 0.75rem;
    height: 0.75rem;
    background: linear-gradient(135deg, #bb86fc, #03dac6);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 0 10px rgba(187,134,252,0.5);
  }
  
  .footer-link:hover {
    color: #e1e1e1;
    transform: translateX(1rem);
    text-shadow: 0 0 8px rgba(187,134,252,0.3);
    padding-left: 0.5rem;
  }
  
  .footer-link:hover::before {
    opacity: 1;
    left: -0.5rem;
  }
  
  .footer-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(187,134,252,0.3), transparent);
    transform: scaleX(0);
    transition: transform 0.4s ease;
  }
  
  .footer-link:hover::after {
    transform: scaleX(1);
  }
</style>

