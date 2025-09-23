<script lang="ts">
	import { videoControlsState } from '$lib/stores/video-controls.svelte.ts';
	import PlaybackSpeedSlider from '../video-player/PlaybackSpeedSlider.svelte';
	import VolumeSlider from '../video-player/VolumeSlider.svelte';
	import { VideoThumbnailGenerator, type VideoThumbnail } from '$lib/utils/video-thumbnails';

	interface Props {
		position?: 'overlay' | 'footer';
	}

	let { position = 'overlay' }: Props = $props();

	// Thumbnail state
	let thumbnails: VideoThumbnail[] = $state([]);
	let thumbnailGenerator: VideoThumbnailGenerator | null = null;
	let isGeneratingThumbnails = $state(false);
	let hoverThumbnail: VideoThumbnail | null = $state(null);

	// Volume slider state
	let showVolumeSlider = $state(false);
	let volumeHoverTimeout: number;

	// Timeline drag handling
	function handleTimelineMouseDown(e: MouseEvent) {
		const target = e.target as HTMLElement;

		// If clicking on the timeline background or scrubber, seek and start dragging
		if (!target.hasAttribute('data-loop-marker')) {
			videoControlsState.setDragState(true, 'scrubber');
			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const percentage = (e.clientX - rect.left) / rect.width * 100;
			const seekTime = (percentage / 100) * videoControlsState.duration;


			videoControlsState.seek(percentage);
		}

		// Prevent text selection while dragging
		e.preventDefault();
	}

	function handleScrubberMouseDown(e: MouseEvent) {
		e.stopPropagation();
		videoControlsState.setDragState(true, 'scrubber');
		e.preventDefault();
	}

	function handleLoopStartMouseDown(e: MouseEvent) {
		e.stopPropagation();
		videoControlsState.setDragState(true, 'loopStart');
		e.preventDefault();
	}

	function handleLoopEndMouseDown(e: MouseEvent) {
		e.stopPropagation();
		videoControlsState.setDragState(true, 'loopEnd');
		e.preventDefault();
	}

	function handleTimelineMouseMove(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = x / rect.width;
		videoControlsState.setHoverState(percentage * videoControlsState.duration, x);
	}

	function handleProgressBarLeave() {
		videoControlsState.setHoverState(null);
	}

	// Mouse move/up handlers for dragging
	$effect(() => {
		if (!videoControlsState.isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const timeline = document.querySelector('.video-timeline-active');
			if (!timeline) return;

			const rect = timeline.getBoundingClientRect();
			const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

			if (videoControlsState.dragTarget === 'scrubber') {
				const seekTime = percentage * videoControlsState.duration;


				videoControlsState.seek(percentage * 100);
			} else if (videoControlsState.dragTarget === 'loopStart' && videoControlsState.loopSegment) {
				videoControlsState.loopSegment.start = percentage * videoControlsState.duration;
			} else if (videoControlsState.dragTarget === 'loopEnd' && videoControlsState.loopSegment) {
				videoControlsState.loopSegment.end = percentage * videoControlsState.duration;
			}
		};

		const handleMouseUp = () => {
			videoControlsState.setDragState(false);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	});

	function handleSpeedControlClick(event: MouseEvent) {
		event.stopPropagation();
		videoControlsState.toggleSpeedControl();
	}

	// Volume slider functions
	function handleVolumeMouseEnter() {
		clearTimeout(volumeHoverTimeout);
		showVolumeSlider = true;
	}

	function handleVolumeMouseLeave() {
		volumeHoverTimeout = setTimeout(() => {
			showVolumeSlider = false;
		}, 300); // Small delay to allow moving to slider
	}

	function handleVolumeSliderEnter() {
		clearTimeout(volumeHoverTimeout);
	}

	function handleVolumeSliderLeave() {
		showVolumeSlider = false;
	}

	// Handle click outside and Esc key to close speed popup
	$effect(() => {
		if (!videoControlsState.showSpeedControl) return;

		const handleClickOutside = (e: MouseEvent) => {
			const speedPopup = document.querySelector('.speed-control-overlay');
			const speedButton = document.querySelector('.speed-display');

			if (speedPopup && !speedPopup.contains(e.target as Node) &&
				speedButton && !speedButton.contains(e.target as Node)) {
				videoControlsState.showSpeedControl = false;
			}
		};

		const handleEscKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				videoControlsState.showSpeedControl = false;
			}
		};

		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleEscKey);

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleEscKey);
		};
	});

	// Generate thumbnails when video is ready
	$effect(() => {
		if (videoControlsState.videoElement && videoControlsState.duration > 0 && thumbnails.length === 0) {
			generateThumbnails();
		}
	});

	async function generateThumbnails() {
		if (!videoControlsState.videoElement || isGeneratingThumbnails) return;

		isGeneratingThumbnails = true;
		try {
			thumbnailGenerator = new VideoThumbnailGenerator(videoControlsState.videoElement);
			thumbnails = await thumbnailGenerator.generateThumbnails(30, 60, 34); // 30 thumbnails, 60x34px
		} catch (error) {
			console.warn('Failed to generate thumbnails:', error);
		} finally {
			isGeneratingThumbnails = false;
		}
	}
</script>

<div style="position: {position === 'footer' ? 'fixed' : 'absolute'}; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.9); padding: 16px; z-index: 9999;">
	<!-- Single Row Controls -->
	<div style="display: flex; align-items: center; gap: 16px;">
		<!-- Play/Pause Button -->
		<button
			class="control-button"
			style="width: 40px; height: 40px; background: transparent; border: none; border-radius: 12px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;"
			on:mouseenter={(e) => {
				e.target.style.transform = 'translateY(-1px) scale(1.1)';
			}}
			on:mouseleave={(e) => {
				e.target.style.transform = 'translateY(0) scale(1)';
			}}
			on:click={() => videoControlsState.togglePlay()}
			title={videoControlsState.isPlaying ? 'Pause' : 'Play'}
		>
			{#if videoControlsState.isPlaying}
				<!-- Pause icon -->
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="6" y="4" width="4" height="16"></rect>
					<rect x="14" y="4" width="4" height="16"></rect>
				</svg>
			{:else}
				<!-- Play icon -->
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polygon points="5,3 19,12 5,21"></polygon>
				</svg>
			{/if}
		</button>

		<!-- Volume Button with Slider -->
		<div style="position: relative;">
			<button
				class="control-button volume-button"
				style="width: 40px; height: 40px; background: transparent; border: none; border-radius: 12px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;"
				on:mouseenter={(e) => {
					e.target.style.transform = 'translateY(-1px) scale(1.1)';
					handleVolumeMouseEnter();
				}}
				on:mouseleave={(e) => {
					e.target.style.transform = 'translateY(0) scale(1)';
					handleVolumeMouseLeave();
				}}
				on:click={() => {
					const newMutedState = !videoControlsState.isMuted;
					videoControlsState.updateMutedState(newMutedState);
					if (videoControlsState.videoElement) {
						videoControlsState.videoElement.muted = newMutedState;
					}
				}}
				title={videoControlsState.isMuted ? 'Unmute' : 'Mute'}
			>
			{#if videoControlsState.isMuted}
				<!-- Muted icon -->
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
					<line x1="23" y1="9" x2="17" y2="15"></line>
					<line x1="17" y1="9" x2="23" y2="15"></line>
				</svg>
			{:else}
				<!-- Volume icon -->
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
					<path d="M19.07,4.93a10,10,0,0,1,0,14.14M15.54,8.46a5,5,0,0,1,0,7.07"></path>
				</svg>
			{/if}
			</button>

			<!-- Volume Slider Overlay -->
			{#if showVolumeSlider}
				<div
					class="volume-control-overlay"
					style="position: absolute; bottom: 100%; left: 50%; transform: translateX(calc(-50% - 8px)); margin-bottom: 8px; z-index: 10000;"
					on:mouseenter={handleVolumeSliderEnter}
					on:mouseleave={handleVolumeSliderLeave}
				>
					<VolumeSlider
						volume={videoControlsState.volume}
						isMuted={videoControlsState.isMuted}
						onVolumeChange={(vol) => {
							videoControlsState.updateVolume(vol);
							if (videoControlsState.videoElement) {
								videoControlsState.videoElement.volume = vol;
							}
						}}
						onMutedChange={(muted) => {
							videoControlsState.updateMutedState(muted);
							if (videoControlsState.videoElement) {
								videoControlsState.videoElement.muted = muted;
							}
						}}
					/>
				</div>
			{/if}
		</div>

		<!-- Timeline Container (Flexible) -->
		<div style="flex: 1; min-width: 200px;">
			<div
				id="video-timeline"
				class="video-timeline-active"
				style="position: relative; height: 40px; cursor: pointer; user-select: none; width: 100%; background: linear-gradient(145deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)); border-radius: 12px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 1px 2px rgba(255,255,255,0.1);"
				on:mousedown={handleTimelineMouseDown}
				on:mousemove={handleTimelineMouseMove}
				on:mouseleave={handleProgressBarLeave}
			>
			<!-- Thumbnail Strip -->
			{#if thumbnails.length > 0}
				<div style="position: absolute; top: 0; left: 0; right: 0; height: 100%; display: flex;">
					{#each thumbnails as thumbnail, index}
						<div
							style="flex: 1; height: 100%; overflow: hidden; position: relative; border-right: 1px solid rgba(255,255,255,0.1);"
						>
							<img
								src={thumbnail.dataUrl}
								alt="Video frame at {videoControlsState.formatTime(thumbnail.time)}"
								style="width: 100%; height: 100%; object-fit: cover; display: block;"
								draggable="false"
							/>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Fallback timeline track for when thumbnails are loading -->
				<div style="position: absolute; top: 50%; transform: translateY(-50%); left: 0; right: 0; height: 2px; background: rgba(255, 255, 255, 0.1);"></div>
			{/if}

			<!-- Overlay Elements -->
			<div style="position: absolute; top: 0; left: 0; right: 0; height: 100%; pointer-events: none;">
				<!-- Buffered progress overlay -->
				<div
					style="position: absolute; top: 0; left: 0; height: 100%; background: rgba(255, 255, 255, 0.1); width: {videoControlsState.getBufferedPercentage()}%;"
				></div>

				<!-- Loop segment highlighting -->
				{#if videoControlsState.loopSegment && videoControlsState.duration > 0}
					<!-- Black overlay before loop start -->
					<div
						style="position: absolute; top: 0; left: 0; height: 100%; background: rgba(0, 0, 0, 0.8); width: {(videoControlsState.loopSegment.start / videoControlsState.duration) * 100}%;"
					></div>

					<!-- Blue overlay inside loop -->
					<div
						style="position: absolute; top: 0; height: 100%; background: rgba(59, 130, 246, 0.2); left: {(videoControlsState.loopSegment.start / videoControlsState.duration) * 100}%; width: {((videoControlsState.loopSegment.end - videoControlsState.loopSegment.start) / videoControlsState.duration) * 100}%;"
					></div>

					<!-- Black overlay after loop end -->
					<div
						style="position: absolute; top: 0; right: 0; height: 100%; background: rgba(0, 0, 0, 0.8); width: {100 - (videoControlsState.loopSegment.end / videoControlsState.duration) * 100}%;"
					></div>
				{/if}
			</div>

			<!-- Interactive Elements (with pointer events) -->
			<div style="position: absolute; top: 0; left: 0; right: 0; height: 100%;">
				<!-- Loop start marker -->
				{#if videoControlsState.loopSegment && videoControlsState.duration > 0}
					<div
						data-loop-marker="start"
						style="position: absolute; top: 0; width: 4px; height: 100%; background: #3b82f6; cursor: ew-resize; left: {(videoControlsState.loopSegment.start / videoControlsState.duration) * 100}%; z-index: 10; box-shadow: 0 0 4px rgba(0,0,0,0.5);"
						on:mousedown={handleLoopStartMouseDown}
						title="Loop Start"
					></div>
				{/if}

				<!-- Loop end marker -->
				{#if videoControlsState.loopSegment && videoControlsState.duration > 0}
					<div
						data-loop-marker="end"
						style="position: absolute; top: 0; width: 4px; height: 100%; background: #3b82f6; cursor: ew-resize; left: {(videoControlsState.loopSegment.end / videoControlsState.duration) * 100}%; z-index: 10; box-shadow: 0 0 4px rgba(0,0,0,0.5);"
						on:mousedown={handleLoopEndMouseDown}
						title="Loop End"
					></div>
				{/if}

				<!-- Breakpoint markers -->
				{#each videoControlsState.breakpoints as bp}
					<div
						style="position: absolute; top: 4px; width: 12px; height: 12px; background: #fbbf24; border-radius: 50%; cursor: pointer; left: {(bp.startTime / videoControlsState.duration) * 100}%; transform: translateX(-50%); z-index: 10; box-shadow: 0 0 4px rgba(0,0,0,0.5);"
						on:click|stopPropagation={() => videoControlsState.toggleBreakpoint(bp.id)}
						title={bp.label}
					></div>
				{/each}

				<!-- Current time indicator -->
				<div
					style="position: absolute; top: 0; width: 3px; height: 100%; background: #ef4444; cursor: grab; left: {videoControlsState.getCurrentTimePercentage()}%; transform: translateX(-50%); z-index: 11; box-shadow: 0 0 8px rgba(0,0,0,0.8);"
					style:cursor={videoControlsState.isDragging && videoControlsState.dragTarget === 'scrubber' ? 'grabbing' : 'grab'}
					style:width={videoControlsState.isDragging && videoControlsState.dragTarget === 'scrubber' ? '5px' : '3px'}
					on:mousedown={handleScrubberMouseDown}
				>
					<!-- Circle at top of play marker -->
					<div
						style="position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 10px; height: 10px; background: #ef4444; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"
					></div>
				</div>

				<!-- Hover time indicator -->
				{#if videoControlsState.hoverTime !== null}
					<div
						style="position: absolute; top: -32px; background: rgba(0, 0, 0, 0.95); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; pointer-events: none; left: {videoControlsState.hoverX}px; transform: translateX(-50%); z-index: 20;"
					>
						{videoControlsState.formatTime(videoControlsState.hoverTime)}
					</div>
				{/if}
			</div>
		</div>
	</div>

		<!-- Speed Controls Group -->
		<div style="display: flex; align-items: center; gap: 4px;">
			<!-- Decrease speed -->
			<button
				class="control-button"
				style="width: 40px; height: 40px; background: transparent; border: none; border-radius: 12px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;"
				on:mouseenter={(e) => {
					e.target.style.transform = 'translateY(-1px) scale(1.1)';
				}}
				on:mouseleave={(e) => {
					e.target.style.transform = 'translateY(0) scale(1)';
				}}
				on:click={() => videoControlsState.adjustSpeed(-0.25)}
				title="Decrease speed"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="15,18 9,12 15,6"></polyline>
				</svg>
			</button>

			<!-- Speed display -->
			<button
				class="control-button speed-display"
				style="min-width: 56px; height: 40px; background: transparent; border: none; border-radius: 12px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; font-size: 12px; font-family: monospace;"
				on:mouseenter={(e) => {
					e.target.style.transform = 'translateY(-1px) scale(1.05)';
				}}
				on:mouseleave={(e) => {
					e.target.style.transform = 'translateY(0) scale(1)';
				}}
				on:click={handleSpeedControlClick}
				title="Speed control"
			>
				{videoControlsState.playbackRate.toFixed(2)}×
			</button>

			<!-- Increase speed -->
			<button
				class="control-button"
				style="width: 40px; height: 40px; background: transparent; border: none; border-radius: 12px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;"
				on:mouseenter={(e) => {
					e.target.style.transform = 'translateY(-1px) scale(1.1)';
				}}
				on:mouseleave={(e) => {
					e.target.style.transform = 'translateY(0) scale(1)';
				}}
				on:click={() => videoControlsState.adjustSpeed(0.25)}
				title="Increase speed"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9,18 15,12 9,6"></polyline>
				</svg>
			</button>
		</div>

		<!-- Fullscreen Button -->
		<button
			class="control-button"
			style="width: 40px; height: 40px; background: transparent; border: none; border-radius: 12px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;"
			on:mouseenter={(e) => {
				e.target.style.transform = 'translateY(-1px) scale(1.1)';
			}}
			on:mouseleave={(e) => {
				e.target.style.transform = 'translateY(0) scale(1)';
			}}
			on:click={() => {
				if (document.fullscreenElement) {
					document.exitFullscreen();
				} else {
					document.documentElement.requestFullscreen();
				}
			}}
			title="Toggle fullscreen"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
			</svg>
		</button>
	</div>

	<!-- Speed Control Overlay -->
	{#if videoControlsState.showSpeedControl}
		<div class="speed-control-overlay" style="position: absolute; bottom: 100%; right: 0; margin-bottom: 8px; z-index: 10000;" on:click={(e) => e.stopPropagation()}>
			<PlaybackSpeedSlider
				playbackRate={videoControlsState.playbackRate}
				onSpeedChange={videoControlsState.updatePlaybackRate.bind(videoControlsState)}
			/>
		</div>
	{/if}

	<!-- Thumbnail loading indicator -->
	{#if isGeneratingThumbnails}
		<div style="text-align: center; color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 8px;">
			Generating timeline thumbnails...
		</div>
	{/if}
</div>