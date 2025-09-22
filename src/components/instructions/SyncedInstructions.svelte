<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { VideoInstructions } from '$lib/types';
  
  let { 
    instructions,
    player, 
    playerReady = false 
  } = $props<{
    instructions: VideoInstructions;
    player: any;
    playerReady?: boolean;
  }>();
  
  // We don't make player a state variable since it's a prop
  
  let currentStep = $state(null);
  let checkInterval: number;
  
  onMount(() => {
    setupInstructionsSync();
    
    return () => {
      clearInterval(checkInterval);
    };
  });
  
  onDestroy(() => {
    clearInterval(checkInterval);
  });
  
  function setupInstructionsSync() {
    clearInterval(checkInterval);
    
    checkInterval = setInterval(() => {
      if (!player || !playerReady) return;
      
      const currentTime = player.getCurrentTime();
      
      // Find the current step based on video time
      currentStep = instructions.steps.find(step => 
        currentTime >= step.startTime && currentTime <= step.endTime
      ) || null;
      
    }, 500) as unknown as number;
  }
</script>

<div class="grid md:grid-cols-2 grid-cols-1 gap-6 mt-8">
  <div class="p-6 bg-dark-elevated rounded-xl border border-border-dark shadow-dark">
    <h3 class="mt-0 mb-6 text-center text-dark-primary font-semibold tracking-wider relative inline-block left-1/2 -translate-x-1/2 after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-primary-light after:to-secondary after:rounded-sm">
      Leader Instructions
    </h3>
    
    <div class="flex flex-col gap-3">
      {#each instructions.steps as step}
        <div 
          class="p-4 bg-dark-surface rounded-lg border-l-[3px] border-transparent cursor-pointer transition-all duration-300 shadow-dark-sm
                 hover:bg-dark-card hover:-translate-y-[3px] hover:shadow-dark
                 {currentStep?.id === step.id ? 'border-l-primary-light bg-[rgba(98,0,234,0.1)] shadow-[0_4px_10px_rgba(98,0,234,0.2)] -translate-y-[3px] scale-[1.02]' : ''}"
          on:click={() => player?.seekTo(step.startTime, true)}
        >
          <div class="text-[0.8rem] text-dark-secondary mb-2 font-medium bg-dark-bg inline-block py-[0.2rem] px-2 rounded border border-border-dark">
            {step.startTime}s - {step.endTime}s
          </div>
          <div class="text-base text-dark-primary leading-relaxed">
            {step.leaderInstructions}
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <div class="p-6 bg-dark-elevated rounded-xl border border-border-dark shadow-dark">
    <h3 class="mt-0 mb-6 text-center text-dark-primary font-semibold tracking-wider relative inline-block left-1/2 -translate-x-1/2 after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-primary-light after:to-secondary after:rounded-sm">
      Follower Instructions
    </h3>
    
    <div class="flex flex-col gap-3">
      {#each instructions.steps as step}
        <div 
          class="p-4 bg-dark-surface rounded-lg border-l-[3px] border-transparent cursor-pointer transition-all duration-300 shadow-dark-sm
                 hover:bg-dark-card hover:-translate-y-[3px] hover:shadow-dark
                 {currentStep?.id === step.id ? 'border-l-primary-light bg-[rgba(98,0,234,0.1)] shadow-[0_4px_10px_rgba(98,0,234,0.2)] -translate-y-[3px] scale-[1.02]' : ''}"
          on:click={() => player?.seekTo(step.startTime, true)}
        >
          <div class="text-[0.8rem] text-dark-secondary mb-2 font-medium bg-dark-bg inline-block py-[0.2rem] px-2 rounded border border-border-dark">
            {step.startTime}s - {step.endTime}s
          </div>
          <div class="text-base text-dark-primary leading-relaxed">
            {step.followerInstructions}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>