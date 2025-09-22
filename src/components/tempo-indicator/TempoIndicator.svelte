<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { TempoSettings } from '$lib/types';
  
  let { 
    tempoSettings, 
    player, 
    playerReady = false 
  } = $props<{
    tempoSettings: TempoSettings;
    player: any;
    playerReady?: boolean;
  }>();
  
  // We don't make player a state variable since it's a prop
  
  let currentBeat = $state(0);
  let isPlaying = $state(false);
  let interval: number;
  
  $effect(() => {
    if (player && playerReady) {
      setupTempoSync();
    }
  });
  
  onMount(() => {
    setupTempoSync();
    
    return () => {
      clearInterval(interval);
    };
  });
  
  onDestroy(() => {
    clearInterval(interval);
  });
  
  function setupTempoSync() {
    clearInterval(interval);
    
    interval = setInterval(() => {
      if (!player || !playerReady) return;
      
      const state = player.getPlayerState();
      isPlaying = state === 1; // 1 means playing
      
      if (isPlaying) {
        // In a real app, we would calculate the exact beat based on BPM and video time
        // For now, we'll just increment the beat for demonstration
        currentBeat = (currentBeat + 1) % tempoSettings.count;
      }
    }, 1000 / (tempoSettings.count)) as unknown as number; // Simplified - in real app would use actual BPM
  }
  
  function isBeatActive(beat: number): boolean {
    return tempoSettings.beats.includes(beat);
  }
</script>

<div class="card mt-8 p-8 text-center group hover:-translate-y-1">
  <div class="flex justify-center gap-4">
    {#each Array(tempoSettings.count) as _, i}
      <div 
        class="w-12 h-12 flex items-center justify-center rounded-full bg-dark-surface font-bold text-[#b0b0b0] transition-all duration-200 border border-border-dark shadow-dark-sm
               hover:border-accent hover:shadow-dark
               {i === currentBeat && isPlaying ? 'bg-gradient-primary text-white scale-110 transition-all duration-150 shadow-[0_0_15px_rgba(98,0,234,0.5)] border-0' : ''}
               {isBeatActive(i + 1) ? 'border-2 border-secondary' : ''}
               {i === currentBeat && isPlaying && isBeatActive(i + 1) ? 'shadow-[0_0_20px_rgba(3,218,198,0.6)]' : ''}"
      >
        <span class="text-lg">{i + 1}</span>
      </div>
    {/each}
  </div>
  
  <div class="mt-6 inline-block text-base text-dark-primary font-medium tracking-wider uppercase bg-dark-surface px-4 py-2 rounded-full border border-border-dark">
    <div class="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-accent"><path d="M8 17a5 5 0 0 1 5-5m-5-5v10"></path><circle cx="17" cy="17" r="3"></circle><path d="M8 7a5 5 0 0 1 5 5"></path></svg>
      {tempoSettings.type.charAt(0).toUpperCase() + tempoSettings.type.slice(1)} Tempo
    </div>
  </div>
</div>