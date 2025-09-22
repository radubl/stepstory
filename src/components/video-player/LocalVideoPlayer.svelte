<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { VideoBreakpoint } from '$lib/types';

	interface Props {
		videoPath: string;
		breakpoints?: VideoBreakpoint[];
		autoPlay?: boolean;
	}

	let { videoPath, breakpoints = [], autoPlay = false }: Props = $props();

	// Video element reference
	let videoElement: HTMLVideoElement;
	let containerElement: HTMLDivElement;

	// Player state
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(1);
	let isMuted = $state(false);
	let playbackRate = $state(1);
	let isFullscreen = $state(false);
	let bufferedRanges = $state<TimeRanges | null>(null);

	// Breakpoint and looping state
	let activeBreakpoints = $state<Set<string>>(new Set());
	let loopSegment = $state<{ start: number; end: number } | null>(null);
	let isLooping = $state(false);

	// UI state
	let showControls = $state(true);
	let controlsTimeout: number;
	let isSeeking = $state(false);
	let hoverTime = $state<number | null>(null);
	let hoverX = $state(0);
	let isDragging = $state(false);
	let dragTarget = $state<'scrubber' | 'loopStart' | 'loopEnd' | null>(null);

	// Animation frame for smooth updates
	let animationFrameId: number;

	// Initialize video when component mounts
	onMount(() => {
		if (videoElement) {
			videoElement.volume = volume;
			if (autoPlay) {
				videoElement.play();
			}
		}

		// Initialize loop segment to full video length once duration is known
		if (!loopSegment && duration > 0) {
			loopSegment = { start: 0, end: duration };
			isLooping = true;
		}

		// Update time smoothly
		const updateTime = () => {
			if (videoElement && !isSeeking) {
				currentTime = videoElement.currentTime;

				// Check for breakpoints
				checkBreakpoints();

				// Handle looping
				if (isLooping && loopSegment && currentTime >= loopSegment.end) {
					videoElement.currentTime = loopSegment.start;
				}
			}
			animationFrameId = requestAnimationFrame(updateTime);
		};
		animationFrameId = requestAnimationFrame(updateTime);

		// Global drag handling
		function handleGlobalMouseMove(e: MouseEvent) {
			if (isDragging && dragTarget) {
				const timeline = document.getElementById('video-timeline');
				if (timeline && duration > 0) {
					const rect = timeline.getBoundingClientRect();
					const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
					const time = (percentage / 100) * duration;

					if (dragTarget === 'scrubber') {
						seek(percentage);
					} else if (dragTarget === 'loopStart' && loopSegment) {
						loopSegment = { ...loopSegment, start: Math.min(time, loopSegment.end - 0.5) };
					} else if (dragTarget === 'loopEnd' && loopSegment) {
						loopSegment = { ...loopSegment, end: Math.max(time, loopSegment.start + 0.5) };
					}
				}
			}
		}

		function handleGlobalMouseUp() {
			isDragging = false;
			dragTarget = null;
		}

		// Event listeners
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
		document.addEventListener('mousemove', handleGlobalMouseMove);
		document.addEventListener('mouseup', handleGlobalMouseUp);

		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
			document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseup', handleGlobalMouseUp);
		};
	});

	onDestroy(() => {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
		if (controlsTimeout) {
			clearTimeout(controlsTimeout);
		}
	});

	// Check if current time hits any breakpoints
	function checkBreakpoints() {
		if (!videoElement || activeBreakpoints.size === 0) return;

		for (const bp of breakpoints) {
			if (activeBreakpoints.has(bp.id)) {
				// Check if we've reached a breakpoint (within 0.1 second tolerance)
				if (Math.abs(currentTime - bp.startTime) < 0.1) {
					videoElement.pause();
					isPlaying = false;
					activeBreakpoints.delete(bp.id); // Remove so it doesn't trigger again immediately
				}
			}
		}
	}

	// Video event handlers
	function handleLoadedMetadata() {
		if (videoElement) {
			duration = videoElement.duration;
			// Initialize loop segment to full video
			if (!loopSegment && duration > 0) {
				loopSegment = { start: 0, end: duration };
				isLooping = true;
			}
		}
	}

	function handlePlay() {
		isPlaying = true;
	}

	function handlePause() {
		isPlaying = false;
	}

	function handleProgress() {
		if (videoElement) {
			bufferedRanges = videoElement.buffered;
		}
	}

	function handleVolumeChange() {
		if (videoElement) {
			volume = videoElement.volume;
			isMuted = videoElement.muted;
		}
	}

	// Control functions
	function togglePlay() {
		if (!videoElement) return;

		if (isPlaying) {
			videoElement.pause();
		} else {
			videoElement.play();
		}
	}

	function seek(value: number) {
		if (!videoElement) return;

		const seekTime = (value / 100) * duration;
		videoElement.currentTime = seekTime;
		currentTime = seekTime;
	}

	function handleSeekStart() {
		isSeeking = true;
	}

	function handleSeekEnd() {
		isSeeking = false;
	}

	function setVolume(value: number) {
		if (!videoElement) return;

		const normalizedVolume = value / 100;
		videoElement.volume = normalizedVolume;
		volume = normalizedVolume;

		if (normalizedVolume > 0 && isMuted) {
			videoElement.muted = false;
			isMuted = false;
		}
	}

	function toggleMute() {
		if (!videoElement) return;

		videoElement.muted = !videoElement.muted;
		isMuted = videoElement.muted;
	}

	function setPlaybackSpeed(speed: number) {
		if (!videoElement) return;

		videoElement.playbackRate = speed;
		playbackRate = speed;
	}

	function skip(seconds: number) {
		if (!videoElement) return;

		const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
		videoElement.currentTime = newTime;
		currentTime = newTime;
	}

	function toggleFullscreen() {
		if (!containerElement) return;

		if (!isFullscreen) {
			if (containerElement.requestFullscreen) {
				containerElement.requestFullscreen();
			} else if ((containerElement as any).webkitRequestFullscreen) {
				(containerElement as any).webkitRequestFullscreen();
			}
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if ((document as any).webkitExitFullscreen) {
				(document as any).webkitExitFullscreen();
			}
		}
	}

	function handleFullscreenChange() {
		isFullscreen = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
	}

	// Breakpoint management
	function toggleBreakpoint(breakpointId: string) {
		if (activeBreakpoints.has(breakpointId)) {
			activeBreakpoints.delete(breakpointId);
		} else {
			activeBreakpoints.add(breakpointId);
		}
		activeBreakpoints = new Set(activeBreakpoints); // Trigger reactivity
	}

	function addBreakpointAtCurrentTime() {
		if (!videoElement) return;

		const newBreakpoint: VideoBreakpoint = {
			id: `bp-${Date.now()}`,
			startTime: currentTime,
			endTime: currentTime,
			label: `Breakpoint at ${formatTime(currentTime)}`
		};

		breakpoints = [...breakpoints, newBreakpoint];
		activeBreakpoints.add(newBreakpoint.id);
		activeBreakpoints = new Set(activeBreakpoints);
	}

	// Looping functions
	function setLoopStart() {
		if (!loopSegment) {
			loopSegment = { start: currentTime, end: duration };
		} else {
			loopSegment = { ...loopSegment, start: currentTime };
		}
	}

	function setLoopEnd() {
		if (!loopSegment) {
			loopSegment = { start: 0, end: currentTime };
		} else {
			loopSegment = { ...loopSegment, end: currentTime };
		}
	}

	function toggleLoop() {
		if (!loopSegment) {
			// Set default loop to current position + 10 seconds
			loopSegment = {
				start: currentTime,
				end: Math.min(currentTime + 10, duration)
			};
			isLooping = true;
		} else {
			isLooping = !isLooping;
		}
	}

	function clearLoop() {
		loopSegment = null;
		isLooping = false;
	}

	// Format time helper
	function formatTime(seconds: number): string {
		if (isNaN(seconds)) return '0:00';

		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	// Mouse control handlers
	function showControlsTemporary() {
		showControls = true;
		if (controlsTimeout) {
			clearTimeout(controlsTimeout);
		}
		controlsTimeout = setTimeout(() => {
			showControls = false;
		}, 3000) as unknown as number;
	}

	function handleProgressBarHover(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = x / rect.width;
		hoverTime = percentage * duration;
		hoverX = x;
	}

	function handleProgressBarLeave() {
		hoverTime = null;
	}

	// Timeline drag handling
	function handleTimelineMouseDown(e: MouseEvent) {
		const target = e.target as HTMLElement;

		// If clicking on the timeline background or scrubber, seek and start dragging
		if (!target.hasAttribute('data-loop-marker')) {
			isDragging = true;
			dragTarget = 'scrubber';
			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const percentage = ((e.clientX - rect.left) / rect.width) * 100;
			seek(percentage);
		}

		// Prevent text selection while dragging
		e.preventDefault();
	}

	function handleScrubberMouseDown(e: MouseEvent) {
		e.stopPropagation();
		isDragging = true;
		dragTarget = 'scrubber';
		e.preventDefault();
	}

	function handleLoopStartMouseDown(e: MouseEvent) {
		e.stopPropagation();
		isDragging = true;
		dragTarget = 'loopStart';
		e.preventDefault();
	}

	function handleLoopEndMouseDown(e: MouseEvent) {
		e.stopPropagation();
		isDragging = true;
		dragTarget = 'loopEnd';
		e.preventDefault();
	}

	function handleTimelineMouseMove(e: MouseEvent) {
		// Handle hover preview
		handleProgressBarHover(e);
	}

	function handleTimelineMouseUp() {
		isDragging = false;
		dragTarget = null;
	}


	// Keyboard shortcuts
	function handleKeyDown(e: KeyboardEvent) {
		if (!videoElement) return;

		switch(e.key) {
			case ' ':
			case 'k':
				e.preventDefault();
				togglePlay();
				break;
			case 'ArrowLeft':
			case 'j':
				e.preventDefault();
				skip(-10);
				break;
			case 'ArrowRight':
			case 'l':
				e.preventDefault();
				skip(10);
				break;
			case 'ArrowUp':
				e.preventDefault();
				setVolume(Math.min((volume * 100) + 10, 100));
				break;
			case 'ArrowDown':
				e.preventDefault();
				setVolume(Math.max((volume * 100) - 10, 0));
				break;
			case 'm':
				e.preventDefault();
				toggleMute();
				break;
			case 'f':
				e.preventDefault();
				toggleFullscreen();
				break;
			case ',':
				e.preventDefault();
				skip(-5);
				break;
			case '.':
				e.preventDefault();
				skip(5);
				break;
			case '<':
				e.preventDefault();
				setPlaybackSpeed(Math.max(playbackRate - 0.25, 0.25));
				break;
			case '>':
				e.preventDefault();
				setPlaybackSpeed(Math.min(playbackRate + 0.25, 2));
				break;
		}
	}

	// Calculate buffered percentage
	function getBufferedPercentage(): number {
		if (!bufferedRanges || bufferedRanges.length === 0) return 0;

		// Find the buffered range that includes current time
		for (let i = 0; i < bufferedRanges.length; i++) {
			if (bufferedRanges.start(i) <= currentTime && bufferedRanges.end(i) >= currentTime) {
				return (bufferedRanges.end(i) / duration) * 100;
			}
		}
		return 0;
	}
</script>

<div
	class="local-video-player relative bg-black rounded-xl overflow-hidden shadow-2xl mx-auto"
	style="width: 50vw;"
	bind:this={containerElement}
	on:mousemove={showControlsTemporary}
	on:keydown={handleKeyDown}
	tabindex="0"
>
	<!-- Video Element -->
	<div class="relative w-full" style="aspect-ratio: 16/9;">
		<video
			bind:this={videoElement}
			src={videoPath}
			class="absolute inset-0 w-full h-full object-contain bg-black z-10"
			on:loadedmetadata={handleLoadedMetadata}
			on:play={handlePlay}
			on:pause={handlePause}
			on:progress={handleProgress}
			on:volumechange={handleVolumeChange}
			on:click={togglePlay}
			playsinline
		>
			<track kind="captions" />
		</video>


		<!-- Video Timeline Overlay -->
		<div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.9); padding: 16px; z-index: 9999;">
			<!-- Timeline -->
			<div style="margin-bottom: 12px; padding: 10px 0;">
				<div
					id="video-timeline"
					style="position: relative; height: 22px; background: transparent; cursor: pointer; user-select: none; width: 100%;"
					on:mousedown={handleTimelineMouseDown}
					on:mousemove={handleTimelineMouseMove}
					on:mouseleave={handleProgressBarLeave}
				>
					<!-- Timeline track background -->
					<div
						style="position: absolute; top: 50%; transform: translateY(-50%); left: 0; right: 0; height: 2px; background: rgba(255, 255, 255, 0.1);"
					></div>

					<!-- Buffered progress -->
					<div
						style="position: absolute; top: 50%; transform: translateY(-50%); left: 0; height: 2px; background: rgba(255, 255, 255, 0.3); width: {getBufferedPercentage()}%;"
					></div>

					<!-- Loop segment highlight -->
					{#if loopSegment && duration > 0}
						<div
							style="position: absolute; top: 50%; transform: translateY(-50%); height: 2px; background: rgba(251, 191, 36, 0.3); left: {(loopSegment.start / duration) * 100}%; width: {((loopSegment.end - loopSegment.start) / duration) * 100}%;"
						></div>
					{/if}

					<!-- Played progress -->
					<div
						style="position: absolute; top: 50%; transform: translateY(-50%); left: 0; height: 2px; background: #ef4444; width: {duration ? (currentTime / duration) * 100 : 0}%;"
					></div>

					<!-- Loop start marker -->
					{#if loopSegment && duration > 0}
						<div
							data-loop-marker="start"
							style="position: absolute; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: #10b981; cursor: ew-resize; left: {(loopSegment.start / duration) * 100}%; z-index: 10;"
							on:mousedown={handleLoopStartMouseDown}
							title="Loop Start"
						></div>
					{/if}

					<!-- Loop end marker -->
					{#if loopSegment && duration > 0}
						<div
							data-loop-marker="end"
							style="position: absolute; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: #f59e0b; cursor: ew-resize; left: {(loopSegment.end / duration) * 100}%; z-index: 10;"
							on:mousedown={handleLoopEndMouseDown}
							title="Loop End"
						></div>
					{/if}

					<!-- Breakpoint markers -->
					{#each breakpoints as bp}
						<div
							style="position: absolute; top: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: #fbbf24; border-radius: 50%; cursor: pointer; left: {(bp.startTime / duration) * 100}%;"
							on:click|stopPropagation={() => toggleBreakpoint(bp.id)}
							title={bp.label}
						></div>
					{/each}

					<!-- Hover time indicator -->
					{#if hoverTime !== null}
						<div
							style="position: absolute; top: -32px; background: rgba(0, 0, 0, 0.95); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; pointer-events: none; left: {hoverX}px; transform: translateX(-50%);"
						>
							{formatTime(hoverTime)}
						</div>
					{/if}

					<!-- Current time indicator -->
					<div
						style="position: absolute; top: 50%; transform: translate(-50%, -50%); width: 3px; height: {isDragging && dragTarget === 'scrubber' ? 16 : 12}px; background: white; box-shadow: 0 0 4px rgba(0,0,0,0.5); transition: height 0.1s; left: {duration ? (currentTime / duration) * 100 : 0}%; cursor: grab; z-index: 11;"
						style:cursor={isDragging && dragTarget === 'scrubber' ? 'grabbing' : 'grab'}
						on:mousedown={handleScrubberMouseDown}
					></div>
				</div>
			</div>

			<!-- Time info -->
			<div style="display: flex; justify-content: space-between; align-items: center; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
				<div style="font-family: monospace;">
					{formatTime(currentTime)} / {formatTime(duration)}
				</div>
				<div style="font-size: 12px;">
					{#if playbackRate !== 1}
						{playbackRate}× speed
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.local-video-player:focus {
		outline: none;
	}

	.local-video-player:fullscreen {
		background: black;
	}
</style>