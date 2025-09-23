<script lang="ts">
	import { videoControlsState } from '$lib/stores/video-controls.svelte.ts';
	import PlaybackSpeedSlider from '../video-player/PlaybackSpeedSlider.svelte';

	interface Props {
		position?: 'overlay' | 'footer';
	}

	let { position = 'overlay' }: Props = $props();

	// Timeline drag handling
	function handleTimelineMouseDown(e: MouseEvent) {
		const target = e.target as HTMLElement;

		// If clicking on the timeline background or scrubber, seek and start dragging
		if (!target.hasAttribute('data-loop-marker')) {
			videoControlsState.setDragState(true, 'scrubber');
			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const percentage = (e.clientX - rect.left) / rect.width * 100;
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
</script>

<div style="position: {position === 'footer' ? 'fixed' : 'absolute'}; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.9); padding: 16px; z-index: 9999;">
	<!-- Timeline -->
	<div style="margin-bottom: 12px; padding: 10px 0;">
		<div
			id="video-timeline"
			class="video-timeline-active"
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
				style="position: absolute; top: 50%; transform: translateY(-50%); left: 0; height: 2px; background: rgba(255, 255, 255, 0.3); width: {videoControlsState.getBufferedPercentage()}%;"
			></div>

			<!-- Loop segment highlight -->
			{#if videoControlsState.loopSegment && videoControlsState.duration > 0}
				<div
					style="position: absolute; top: 50%; transform: translateY(-50%); height: 2px; background: rgba(251, 191, 36, 0.3); left: {(videoControlsState.loopSegment.start / videoControlsState.duration) * 100}%; width: {((videoControlsState.loopSegment.end - videoControlsState.loopSegment.start) / videoControlsState.duration) * 100}%;"
				></div>
			{/if}

			<!-- Played progress -->
			<div
				style="position: absolute; top: 50%; transform: translateY(-50%); left: 0; height: 2px; background: #ef4444; width: {videoControlsState.getCurrentTimePercentage()}%;"
			></div>

			<!-- Loop start marker -->
			{#if videoControlsState.loopSegment && videoControlsState.duration > 0}
				<div
					data-loop-marker="start"
					style="position: absolute; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: #10b981; cursor: ew-resize; left: {(videoControlsState.loopSegment.start / videoControlsState.duration) * 100}%; z-index: 10;"
					on:mousedown={handleLoopStartMouseDown}
					title="Loop Start"
				></div>
			{/if}

			<!-- Loop end marker -->
			{#if videoControlsState.loopSegment && videoControlsState.duration > 0}
				<div
					data-loop-marker="end"
					style="position: absolute; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: #f59e0b; cursor: ew-resize; left: {(videoControlsState.loopSegment.end / videoControlsState.duration) * 100}%; z-index: 10;"
					on:mousedown={handleLoopEndMouseDown}
					title="Loop End"
				></div>
			{/if}

			<!-- Breakpoint markers -->
			{#each videoControlsState.breakpoints as bp}
				<div
					style="position: absolute; top: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: #fbbf24; border-radius: 50%; cursor: pointer; left: {(bp.startTime / videoControlsState.duration) * 100}%;"
					on:click|stopPropagation={() => videoControlsState.toggleBreakpoint(bp.id)}
					title={bp.label}
				></div>
			{/each}

			<!-- Hover time indicator -->
			{#if videoControlsState.hoverTime !== null}
				<div
					style="position: absolute; top: -32px; background: rgba(0, 0, 0, 0.95); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; pointer-events: none; left: {videoControlsState.hoverX}px; transform: translateX(-50%);"
				>
					{videoControlsState.formatTime(videoControlsState.hoverTime)}
				</div>
			{/if}

			<!-- Current time indicator -->
			<div
				style="position: absolute; top: 50%; transform: translate(-50%, -50%); width: 3px; height: {videoControlsState.isDragging && videoControlsState.dragTarget === 'scrubber' ? 16 : 12}px; background: white; box-shadow: 0 0 4px rgba(0,0,0,0.5); transition: height 0.1s; left: {videoControlsState.getCurrentTimePercentage()}%; cursor: grab; z-index: 11;"
				style:cursor={videoControlsState.isDragging && videoControlsState.dragTarget === 'scrubber' ? 'grabbing' : 'grab'}
				on:mousedown={handleScrubberMouseDown}
			></div>
		</div>
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