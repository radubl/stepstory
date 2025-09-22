<script lang="ts">
	import LocalVideoPlayer from '$lib/../components/video-player/LocalVideoPlayer.svelte';
</script>

<svelte:head>
	<title>Video Only - StepStory</title>
</svelte:head>

<div class="min-h-screen bg-dark-bg py-8">
	<LocalVideoPlayer
		videoPath="/videos/testvideo.mp4"
		breakpoints={[]}
		autoPlay={false}
	/>
</div>