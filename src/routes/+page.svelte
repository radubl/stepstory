<script lang="ts">
  import { danceStyles } from '$lib/stores/danceStyles.svelte.ts';
  import { videos } from '$lib/stores/videos.svelte.ts';
  import { getDanceStyleSlug, getVideoSlug } from '$lib/utils/slugs';
</script>

<svelte:head>
  <title>StepStory - Learn to Dance Step by Step</title>
</svelte:head>

<section class="section pt-4 md:pt-6 bg-dark-elevated bg-gradient-to-br from-primary/10 to-secondary/10 text-center">
  <div class="container">
    <div class="max-w-[800px] mx-auto">
      <h1 class="font-extrabold text-transparent bg-clip-text bg-gradient-primary mb-6">Master Dance One Step at a Time</h1>
      <p class="text-xl mb-10 text-[#b0b0b0] leading-relaxed">
        Interactive tutorials with synchronized instructions, tempo visualization, and custom
        playback controls to help you learn any dance move with confidence.
      </p>
      <div class="mt-8">
        <a href="/" class="btn px-8 py-4 text-lg">Explore Dance Styles</a>
      </div>
    </div>
  </div>
</section>

<section class="section bg-dark-bg">
  <div class="container">
    <h2 class="section-title">How StepStory Helps You Learn</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div class="feature-card">
        <div class="text-5xl mb-4">🎬</div>
        <h3 class="mb-4 font-bold">Enhanced Video Controls</h3>
        <p class="text-[#b0b0b0]">
          Adjust playback speed and create loops to practice specific moves
          over and over until you master them.
        </p>
      </div>
      
      <div class="feature-card">
        <div class="text-5xl mb-4">🔄</div>
        <h3 class="mb-4 font-bold">Synchronized Instructions</h3>
        <p class="text-[#b0b0b0]">
          See step-by-step instructions for both leaders and followers that
          highlight automatically as the video progresses.
        </p>
      </div>
      
      <div class="feature-card">
        <div class="text-5xl mb-4">🎵</div>
        <h3 class="mb-4 font-bold">Visual Tempo Guide</h3>
        <p class="text-[#b0b0b0]">
          Follow along with a visual tempo indicator that helps you stay on
          beat with the music and understand dance timing.
        </p>
      </div>
      
      <div class="feature-card">
        <div class="text-5xl mb-4">📋</div>
        <h3 class="mb-4 font-bold">Create Personal Playlists</h3>
        <p class="text-[#b0b0b0]">
          Save your favorite tutorials and organize them into customized
          playlists to create your own learning path.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section bg-dark-surface">
  <div class="container">
    <h2 class="section-title">Popular Dance Styles</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {#each danceStyles.getAll() as style}
        <a href="/{getDanceStyleSlug(style)}" class="card group p-0 overflow-hidden h-[200px] relative no-underline">
          <div class="h-full w-full bg-cover bg-center relative flex items-end group-hover:scale-105 transition-transform duration-500" style="background-image: url({style.imageUrl || '/images/placeholder.jpg'})">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
            <h3 class="p-6 text-white relative z-[1] m-0 text-2xl font-bold">{style.name}</h3>
          </div>
        </a>
      {/each}
    </div>
    
    <div class="text-center">
      <a href="/" class="btn btn-outline py-3 px-6 font-bold">View All Dance Styles</a>
    </div>
  </div>
</section>

<section class="section bg-dark-bg">
  <div class="container">
    <h2 class="section-title">Trending Tutorials</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {#each videos.getAll().slice(0, 3) as video}
        <a href="/{getDanceStyleSlug(video.danceStyleId)}/{getVideoSlug(video)}" class="video-card group">
          <div class="relative overflow-hidden">
            <img src="https://img.youtube.com/vi/{video.youtubeId}/mqdefault.jpg" alt={video.title} class="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute top-3 right-3 bg-black/70 text-white py-1 px-2 rounded text-xs font-medium">Level {video.difficulty}</div>
            <div class="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div class="bg-primary rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl mb-2 font-bold">{video.title}</h3>
            <p class="text-[#b0b0b0] mb-4 text-sm">{video.description.substring(0, 100)}...</p>
            <div class="flex justify-between text-xs text-[#b0b0b0]">
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                {danceStyles.getById(video.danceStyleId)?.name || 'Unknown Dance'}
              </span>
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1 text-warning"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                {video.popularity.toFixed(1)}
              </span>
            </div>
          </div>
        </a>
      {/each}
    </div>
    
    <div class="text-center">
      <a href="/" class="btn btn-outline py-3 px-6 font-bold">Browse All Dance Styles</a>
    </div>
  </div>
</section>

<section class="section bg-gradient-to-br from-primary to-[#3700b3] text-white text-center">
  <div class="container">
    <div class="max-w-[800px] mx-auto">
      <h2 class="mb-6 text-3xl md:text-4xl">Ready to Start Your Dance Journey?</h2>
      <p class="mb-8 text-lg opacity-90">
        Join StepStory today and get access to our growing library of dance tutorials,
        personalized playlists, and unique learning tools.
      </p>
      <a href="/" class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary hover:bg-gray-100 rounded-lg font-bold no-underline transition-colors text-lg">
        Get Started Now
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </a>
    </div>
  </div>
</section>