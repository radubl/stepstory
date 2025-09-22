<script lang="ts">
	import LocalVideoPlayer from '$lib/../components/video-player/LocalVideoPlayer.svelte';
	import type { VideoBreakpoint } from '$lib/types';

	// Sample breakpoints for testing
	const testBreakpoints: VideoBreakpoint[] = [
		{
			id: 'bp1',
			startTime: 5,
			endTime: 5,
			label: 'Pause at 5s'
		},
		{
			id: 'bp2',
			startTime: 10,
			endTime: 10,
			label: 'Pause at 10s'
		},
		{
			id: 'bp3',
			startTime: 15,
			endTime: 15,
			label: 'Pause at 15s'
		},
		{
			id: 'bp4',
			startTime: 20,
			endTime: 20,
			label: 'Pause at 20s'
		}
	];
</script>

<svelte:head>
	<title>Test Local Video Player - StepStory</title>
</svelte:head>

<div class="min-h-screen bg-dark-bg py-8">
	<div class="container mx-auto px-4">
		<h1 class="text-3xl font-bold text-white mb-8">Local Video Player Test</h1>

		<div class="max-w-4xl mx-auto space-y-8">
			<!-- Player Instance -->
			<div>
				<h2 class="text-xl font-semibold text-white mb-4">Video Player with Custom Controls</h2>
				<LocalVideoPlayer
					videoPath="/videos/testvideo.mp4"
					breakpoints={testBreakpoints}
					autoPlay={false}
				/>
			</div>

			<!-- Feature Description -->
			<div class="bg-dark-surface rounded-lg p-6 space-y-4">
				<h3 class="text-lg font-semibold text-white mb-3">Features:</h3>
				<ul class="space-y-2 text-gray-300">
					<li class="flex items-start">
						<span class="text-primary mr-2">✓</span>
						<span><strong>Speed Control:</strong> Adjust playback speed from 0.25x to 2x</span>
					</li>
					<li class="flex items-start">
						<span class="text-primary mr-2">✓</span>
						<span><strong>Breakpoints:</strong> Set points where video auto-pauses (click red dots on timeline)</span>
					</li>
					<li class="flex items-start">
						<span class="text-primary mr-2">✓</span>
						<span><strong>Loop Segments:</strong> Use [ and ] buttons to set loop start/end, then toggle loop</span>
					</li>
					<li class="flex items-start">
						<span class="text-primary mr-2">✓</span>
						<span><strong>Skip Controls:</strong> Jump forward/backward 10 seconds</span>
					</li>
					<li class="flex items-start">
						<span class="text-primary mr-2">✓</span>
						<span><strong>Volume Control:</strong> Adjustable volume with mute toggle</span>
					</li>
					<li class="flex items-start">
						<span class="text-primary mr-2">✓</span>
						<span><strong>Fullscreen:</strong> Full screen mode support</span>
					</li>
					<li class="flex items-start">
						<span class="text-primary mr-2">✓</span>
						<span><strong>Keyboard Shortcuts:</strong> Space (play/pause), arrows (seek/volume), M (mute), F (fullscreen)</span>
					</li>
				</ul>
			</div>

			<!-- Instructions -->
			<div class="bg-dark-elevated rounded-lg p-6">
				<h3 class="text-lg font-semibold text-white mb-3">How to Use:</h3>
				<ol class="space-y-2 text-gray-300 list-decimal list-inside">
					<li>Click the video or play button to start playback</li>
					<li>Click the breakpoint buttons below the video to enable auto-pause points</li>
					<li>To create a loop:
						<ul class="ml-6 mt-1 space-y-1 list-disc list-inside text-sm">
							<li>Navigate to your desired loop start and click [</li>
							<li>Navigate to your desired loop end and click ]</li>
							<li>Click the loop icon to enable looping</li>
						</ul>
					</li>
					<li>Use the + button to add new breakpoints at the current playback position</li>
					<li>Adjust playback speed using the dropdown selector</li>
				</ol>
			</div>
		</div>
	</div>
</div>