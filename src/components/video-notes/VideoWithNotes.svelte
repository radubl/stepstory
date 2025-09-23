<script lang="ts">
	import type { VideoConfig } from '$lib/types/video-notes';
	import { setVideoConfig, videoState } from '$lib/stores/video-notes.svelte.ts';
	import { videoControlsState } from '$lib/stores/video-controls.svelte.ts';
	import LocalVideoPlayer from '../video-player/LocalVideoPlayer.svelte';
	import NotesPanel from './NotesPanel.svelte';
	import PlaybackSpeedSlider from '../video-player/PlaybackSpeedSlider.svelte';
	import VideoTimeline from '../video-timeline/VideoTimeline.svelte';

	interface Props {
		config: VideoConfig;
	}

	let { config }: Props = $props();

	// Load saved preferences from localStorage or use defaults
	let showLeaderNotes = $state(true);
	let showFollowerNotes = $state(true);

	// Load preferences from localStorage using $effect
	$effect(() => {
		setVideoConfig(config);

		// Load saved preferences
		const savedLeaderPref = localStorage.getItem('showLeaderNotes');
		const savedFollowerPref = localStorage.getItem('showFollowerNotes');

		if (savedLeaderPref !== null) {
			showLeaderNotes = savedLeaderPref === 'true';
		}
		if (savedFollowerPref !== null) {
			showFollowerNotes = savedFollowerPref === 'true';
		}
	});

	// Save preferences when they change
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('showLeaderNotes', String(showLeaderNotes));
		}
	});

	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('showFollowerNotes', String(showFollowerNotes));
		}
	});

	// Toggle functions
	function toggleLeaderNotes() {
		showLeaderNotes = !showLeaderNotes;
	}

	function toggleFollowerNotes() {
		showFollowerNotes = !showFollowerNotes;
	}

	// Video crop functionality
	let videoCropLeft = $state(0); // Crop from left (percentage)
	let videoCropRight = $state(0); // Crop from right (percentage)
	let isResizing = $state(false);
	let resizeDirection = $state<'left' | 'right' | null>(null);
	let videoContainerWidth = $state(1000); // Larger container width

	// Video element reference for timeline controls
	let videoElement: HTMLVideoElement | null = null;
	let isDragging = $state(false);
	let dragTarget = $state<'scrubber' | 'loop-start' | 'loop-end' | null>(null);
	let hoverTime = $state<number | null>(null);
	let hoverX = $state(0);
	let loopSegment = $state<{start: number, end: number} | null>(null);
	let playbackRate = $state(1);
	let showSpeedControl = $state(false);
	let activeBreakpoints = $state(new Set<string>());
	let breakpoints = $state<any[]>([]);

	// Format time helper
	function formatTime(seconds: number): string {
		if (isNaN(seconds)) return '0:00';
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	// Timeline handlers (exact copy from LocalVideoPlayer)
	function handleTimelineMouseDown(e: MouseEvent) {
		const target = e.target as HTMLElement;

		// If clicking on the timeline background or scrubber, seek and start dragging
		if (!target.hasAttribute('data-loop-marker')) {
			isDragging = true;
			dragTarget = 'scrubber';
			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const percentage = (e.clientX - rect.left) / rect.width;
			seek(percentage * 100);
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

	function handleTimelineMouseMove(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = x / rect.width;
		hoverTime = percentage * videoState.duration;
		hoverX = x;
	}

	function handleProgressBarLeave() {
		hoverTime = null;
	}

	function seek(percentage: number) {
		if (!videoElement) return;
		const time = (percentage / 100) * videoState.duration;
		videoElement.currentTime = time;
		videoState.currentTime = time;
	}

	// Mouse move/up handlers for dragging
	$effect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const timeline = document.getElementById('video-timeline');
			if (!timeline) return;

			const rect = timeline.getBoundingClientRect();
			const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

			if (dragTarget === 'scrubber') {
				seek(percentage * 100);
			} else if (dragTarget === 'loop-start' && loopSegment) {
				loopSegment.start = percentage * videoState.duration;
			} else if (dragTarget === 'loop-end' && loopSegment) {
				loopSegment.end = percentage * videoState.duration;
			}
		};

		const handleMouseUp = () => {
			isDragging = false;
			dragTarget = null;
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	});

	// Get buffered percentage
	function getBufferedPercentage(): number {
		if (!videoElement || !videoState.duration) return 0;
		if (videoElement.buffered.length > 0) {
			const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
			return (bufferedEnd / videoState.duration) * 100;
		}
		return 0;
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

	// Loop marker handlers
	function handleLoopStartMouseDown(e: MouseEvent) {
		e.stopPropagation();
		isDragging = true;
		dragTarget = 'loop-start';
		e.preventDefault();
	}

	function handleLoopEndMouseDown(e: MouseEvent) {
		e.stopPropagation();
		isDragging = true;
		dragTarget = 'loop-end';
		e.preventDefault();
	}

	// Speed control functions
	function handleSpeedChange(newSpeed: number) {
		playbackRate = newSpeed;
		if (videoElement) {
			videoElement.playbackRate = newSpeed;
		}
	}

	function toggleSpeedControl(event: MouseEvent) {
		event.stopPropagation();
		showSpeedControl = !showSpeedControl;
	}

	function adjustSpeed(delta: number) {
		const newSpeed = Math.max(0.25, Math.min(3.0, playbackRate + delta));
		// Round to nearest 0.05 for smoother control
		const roundedSpeed = Math.round(newSpeed * 20) / 20;
		handleSpeedChange(roundedSpeed);
	}

	// Get video element from player
	$effect(() => {
		// Wait a bit for the video player to mount
		setTimeout(() => {
			const videoElements = document.querySelectorAll('video');
			if (videoElements.length > 0) {
				videoElement = videoElements[0] as HTMLVideoElement;
				videoControlsState.setVideoElement(videoElement);

				// Add example loop segment when video is loaded
				if (videoState.duration > 0 && !videoControlsState.loopSegment) {
					// Create a loop segment from 10% to 40% of the video duration
					const startTime = videoState.duration * 0.1;
					const endTime = videoState.duration * 0.4;
					videoControlsState.loopSegment = { start: startTime, end: endTime };
					videoControlsState.isLooping = true; // Enable looping by default
				}

				// Add timeupdate event listener for loop checking
				const handleTimeUpdate = () => {
					if (videoControlsState.loopSegment && videoControlsState.isLooping) {
						const currentTime = videoElement.currentTime;
						const loopEnd = videoControlsState.loopSegment.end;

						// If we've reached or passed the loop end, jump back to loop start
						if (currentTime >= loopEnd) {
							videoElement.currentTime = videoControlsState.loopSegment.start;
						}
					}
				};

				videoElement.addEventListener('timeupdate', handleTimeUpdate);

				// Cleanup function
				return () => {
					if (videoElement) {
						videoElement.removeEventListener('timeupdate', handleTimeUpdate);
					}
				};
			}
		}, 100);
	});

	// Sync videoState with videoControlsState
	$effect(() => {
		videoControlsState.updateCurrentTime(videoState.currentTime);
		videoControlsState.updateDuration(videoState.duration);
	});


	// Global keyboard event listener for video controls
	$effect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only handle keys if not typing in an input/textarea
			if (!(e.target instanceof HTMLInputElement) &&
				!(e.target instanceof HTMLTextAreaElement) &&
				!(e.target as HTMLElement)?.isContentEditable) {

				if (e.code === 'Space') {
					e.preventDefault(); // Prevent page scrolling

					if (videoElement) {
						if (videoElement.paused) {
							videoElement.play();
						} else {
							videoElement.pause();
						}
					}
				} else if (e.code === 'ArrowLeft') {
					e.preventDefault(); // Prevent default scrolling behavior

					if (videoElement) {
						const newTime = Math.max(0, videoElement.currentTime - 5);
						videoElement.currentTime = newTime;
						videoState.currentTime = newTime;
					}
				} else if (e.code === 'ArrowRight') {
					e.preventDefault(); // Prevent default scrolling behavior

					if (videoElement) {
						const newTime = Math.min(videoState.duration, videoElement.currentTime + 5);
						videoElement.currentTime = newTime;
						videoState.currentTime = newTime;
					}
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	function handleResizeStart(direction: 'left' | 'right', event: MouseEvent) {
		isResizing = true;
		resizeDirection = direction;
		event.preventDefault();

		const startX = event.clientX;
		const startCropLeft = videoCropLeft;
		const startCropRight = videoCropRight;

		// Get the actual container width from the DOM
		const container = event.target.closest('.group');
		const containerWidth = container?.getBoundingClientRect().width || 800;

		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing) return;

			const deltaX = e.clientX - startX;
			const cropDelta = (deltaX / containerWidth) * 100; // Convert to percentage

			if (direction === 'left') {
				// Dragging left handle: crop from left side
				videoCropLeft = Math.max(0, Math.min(80, startCropLeft + cropDelta));
			} else {
				// Dragging right handle: crop from right side
				videoCropRight = Math.max(0, Math.min(80, startCropRight - cropDelta));
			}
		};

		const handleMouseUp = () => {
			isResizing = false;
			resizeDirection = null;
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}
</script>

<div class="h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden flex flex-col">
	<div class="flex gap-4 flex-1 p-4 w-full overflow-hidden">
		<!-- Leader Notes Panel (Left) -->
		{#if showLeaderNotes}
			<div class="flex flex-col min-h-0 pr-2 flex-shrink-0 p-6" style="width: 320px;">
				<NotesPanel
					notes={config.leaderNotes}
					title="Leader Instructions"
					role="leader"
					onToggle={toggleLeaderNotes}
					isVisible={showLeaderNotes}
				/>
			</div>
		{:else}
			<div class="flex flex-col min-h-0 pr-2 flex-shrink-0 p-6" style="width: 40px;">
				<NotesPanel
					notes={config.leaderNotes}
					title="Leader Instructions"
					role="leader"
					onToggle={toggleLeaderNotes}
					isVisible={showLeaderNotes}
				/>
			</div>
		{/if}

		<!-- Video Player (Center) -->
		<div
			class="flex-1 min-w-0 video-section relative overflow-hidden"
			style="max-width: calc(100vw - {(showLeaderNotes ? 320 : 40) + (showFollowerNotes ? 320 : 40) + 144}px);"
		>
			<div class="mb-6 group relative w-full">
				<!-- Left resize handle -->
				<div
					class="absolute top-1/2 w-2 h-20 cursor-col-resize bg-white/20 hover:bg-white/40 z-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
					style="left: calc({videoCropLeft}% - 8px); transform: translateY(-50%);"
					class:!bg-blue-400={isResizing && resizeDirection === 'left'}
					class:!opacity-100={isResizing && resizeDirection === 'left'}
					on:mousedown={(e) => handleResizeStart('left', e)}
					title="Drag to crop video from left"
				></div>

				<!-- Right resize handle -->
				<div
					class="absolute top-1/2 w-2 h-20 cursor-col-resize bg-white/20 hover:bg-white/40 z-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
					style="right: calc({videoCropRight}% - 8px); transform: translateY(-50%);"
					class:!bg-blue-400={isResizing && resizeDirection === 'right'}
					class:!opacity-100={isResizing && resizeDirection === 'right'}
					on:mousedown={(e) => handleResizeStart('right', e)}
					title="Drag to crop video from right"
				></div>
				<div
					class="rounded-xl overflow-hidden shadow-2xl w-full"
					style="clip-path: inset(0 {videoCropRight}% 0 {videoCropLeft}%);"
				>
					<LocalVideoPlayer
						videoPath={config.videoPath}
						breakpoints={config.breakpoints || []}
						autoPlay={false}
						enableNotesSync={true}
					/>
				</div>
			</div>
		</div>

		<!-- Follower Notes Panel (Right) -->
		{#if showFollowerNotes}
			<div class="flex flex-col min-h-0 pl-2 flex-shrink-0 p-6" style="width: 320px;">
				<NotesPanel
					notes={config.followerNotes}
					title="Follower Instructions"
					role="follower"
					onToggle={toggleFollowerNotes}
					isVisible={showFollowerNotes}
				/>
			</div>
		{:else}
			<div class="flex flex-col min-h-0 pl-2 flex-shrink-0 p-6" style="width: 40px;">
				<NotesPanel
					notes={config.followerNotes}
					title="Follower Instructions"
					role="follower"
					onToggle={toggleFollowerNotes}
					isVisible={showFollowerNotes}
				/>
			</div>
		{/if}
	</div>

	<!-- Video Timeline (Fixed Bottom) - Using VideoTimeline component -->
<VideoTimeline position="footer" />

<!-- OLD TIMELINE CODE - TO BE REMOVED AFTER TESTING
	<div style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.9); padding: 16px; z-index: 9999;">
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
				{#if loopSegment && videoState.duration > 0}
					<div
						style="position: absolute; top: 50%; transform: translateY(-50%); height: 2px; background: rgba(251, 191, 36, 0.3); left: {(loopSegment.start / videoState.duration) * 100}%; width: {((loopSegment.end - loopSegment.start) / videoState.duration) * 100}%;"
					></div>
				{/if}

				<!-- Played progress -->
				<div
					style="position: absolute; top: 50%; transform: translateY(-50%); left: 0; height: 2px; background: #ef4444; width: {videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0}%;"
				></div>

				<!-- Loop start marker -->
				{#if loopSegment && videoState.duration > 0}
					<div
						data-loop-marker="start"
						style="position: absolute; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: #10b981; cursor: ew-resize; left: {(loopSegment.start / videoState.duration) * 100}%; z-index: 10;"
						on:mousedown={handleLoopStartMouseDown}
						title="Loop Start"
					></div>
				{/if}

				<!-- Loop end marker -->
				{#if loopSegment && videoState.duration > 0}
					<div
						data-loop-marker="end"
						style="position: absolute; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: #f59e0b; cursor: ew-resize; left: {(loopSegment.end / videoState.duration) * 100}%; z-index: 10;"
						on:mousedown={handleLoopEndMouseDown}
						title="Loop End"
					></div>
				{/if}

				<!-- Breakpoint markers -->
				{#each config.breakpoints || [] as bp}
					<div
						style="position: absolute; top: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: #fbbf24; border-radius: 50%; cursor: pointer; left: {(bp.startTime / videoState.duration) * 100}%;"
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
					style="position: absolute; top: 50%; transform: translate(-50%, -50%); width: 3px; height: {isDragging && dragTarget === 'scrubber' ? 16 : 12}px; background: white; box-shadow: 0 0 4px rgba(0,0,0,0.5); transition: height 0.1s; left: {videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0}%; cursor: grab; z-index: 11;"
					style:cursor={isDragging && dragTarget === 'scrubber' ? 'grabbing' : 'grab'}
					on:mousedown={handleScrubberMouseDown}
				></div>
			</div>
		</div>

		<!-- Time info and controls -->
		<div style="display: flex; justify-content: space-between; align-items: center; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
			<div style="font-family: monospace;">
				{formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
			</div>
			<div style="display: flex; align-items: center; gap: 4px;">
				<!-- Decrease speed arrow -->
				<button
					style="background: rgba(187, 134, 252, 0.1); border: 1px solid rgba(187, 134, 252, 0.3); color: #bb86fc; padding: 4px 6px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;"
					on:mouseenter={(e) => e.target.style.background = 'rgba(187, 134, 252, 0.2)'}
					on:mouseleave={(e) => e.target.style.background = 'rgba(187, 134, 252, 0.1)'}
					on:click={() => adjustSpeed(-0.25)}
					title="Decrease speed"
				>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="15,18 9,12 15,6"></polyline>
					</svg>
				</button>

				<!-- Speed display button -->
				<button
					class="speed-control-button"
					style="background: rgba(187, 134, 252, 0.1); border: 1px solid rgba(187, 134, 252, 0.3); color: #bb86fc; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; min-width: 48px;"
					on:mouseenter={(e) => e.target.style.background = 'rgba(187, 134, 252, 0.2)'}
					on:mouseleave={(e) => e.target.style.background = 'rgba(187, 134, 252, 0.1)'}
					on:click={toggleSpeedControl}
				>
					{playbackRate.toFixed(2)}×
				</button>

				<!-- Increase speed arrow -->
				<button
					style="background: rgba(187, 134, 252, 0.1); border: 1px solid rgba(187, 134, 252, 0.3); color: #bb86fc; padding: 4px 6px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;"
					on:mouseenter={(e) => e.target.style.background = 'rgba(187, 134, 252, 0.2)'}
					on:mouseleave={(e) => e.target.style.background = 'rgba(187, 134, 252, 0.1)'}
					on:click={() => adjustSpeed(0.25)}
					title="Increase speed"
				>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9,18 15,12 9,6"></polyline>
					</svg>
				</button>
			</div>
		</div>

		<!-- Speed Control Overlay -->
		{#if showSpeedControl}
			<div class="speed-control-overlay" style="position: absolute; bottom: 100%; right: 0; margin-bottom: 8px; z-index: 10000;" on:click={(e) => e.stopPropagation()}>
				<PlaybackSpeedSlider
					{playbackRate}
					onSpeedChange={handleSpeedChange}
				/>
			</div>
		{/if}
	</div>
-->

