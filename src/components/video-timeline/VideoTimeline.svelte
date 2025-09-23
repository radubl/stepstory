<script lang="ts">
	import { videoControlsState } from '$lib/stores/video-controls.svelte.ts';
	import PlaybackSpeedSlider from '../video-player/PlaybackSpeedSlider.svelte';
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
	<!-- Thumbnail Timeline -->
	<div style="margin-bottom: 12px; padding: 10px 0;">
		<div
			id="video-timeline"
			class="video-timeline-active"
			style="position: relative; height: 40px; cursor: pointer; user-select: none; width: 100%; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden;"
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

		<!-- Thumbnail loading indicator -->
		{#if isGeneratingThumbnails}
			<div style="text-align: center; color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 8px;">
				Generating timeline thumbnails...
			</div>
		{/if}
	</div>

	<!-- Time info and controls -->
	<div style="display: flex; justify-content: space-between; align-items: center; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
		<div style="font-family: monospace;">
			{videoControlsState.formatTime(videoControlsState.currentTime)} / {videoControlsState.formatTime(videoControlsState.duration)}
		</div>
		<div style="display: flex; align-items: center; gap: 4px;">
			<!-- Decrease speed arrow -->
			<button
				style="background: rgba(187, 134, 252, 0.1); border: 1px solid rgba(187, 134, 252, 0.3); color: #bb86fc; padding: 4px 6px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;"
				on:mouseenter={(e) => e.target.style.background = 'rgba(187, 134, 252, 0.2)'}
				on:mouseleave={(e) => e.target.style.background = 'rgba(187, 134, 252, 0.1)'}
				on:click={() => videoControlsState.adjustSpeed(-0.25)}
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
				on:click={handleSpeedControlClick}
			>
				{videoControlsState.playbackRate.toFixed(2)}×
			</button>

			<!-- Increase speed arrow -->
			<button
				style="background: rgba(187, 134, 252, 0.1); border: 1px solid rgba(187, 134, 252, 0.3); color: #bb86fc; padding: 4px 6px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;"
				on:mouseenter={(e) => e.target.style.background = 'rgba(187, 134, 252, 0.2)'}
				on:mouseleave={(e) => e.target.style.background = 'rgba(187, 134, 252, 0.1)'}
				on:click={() => videoControlsState.adjustSpeed(0.25)}
				title="Increase speed"
			>
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9,18 15,12 9,6"></polyline>
				</svg>
			</button>
		</div>
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
</div>