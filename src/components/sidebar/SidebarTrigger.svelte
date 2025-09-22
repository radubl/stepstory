<script lang="ts">
  export let showSidebar: boolean;
  
  function toggleSidebar() {
    showSidebar = !showSidebar;
  }
</script>

<button 
  class="sidebar-trigger md:hidden" 
  on:click={toggleSidebar} 
  aria-label={showSidebar ? 'Close sidebar' : 'Open sidebar'}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    {#if showSidebar}
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    {:else}
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    {/if}
  </svg>
</button>

<style>
  .sidebar-trigger {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #bb86fc, #6200ea);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }
  
  .sidebar-trigger:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  }
  
  @media (min-width: 768px) {
    .sidebar-trigger {
      display: none;
    }
  }
</style>