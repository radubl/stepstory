<script lang="ts">
	interface Props {
		volume: number;
		isMuted: boolean;
		onVolumeChange: (volume: number) => void;
		onMutedChange: (muted: boolean) => void;
	}

	let { volume, isMuted, onVolumeChange, onMutedChange }: Props = $props();

	// Slider state
	let isDragging = $state(false);
	let sliderElement: HTMLDivElement;

	// Convert volume to slider position (0-100%)
	function volumeToPosition(vol: number): number {
		return vol * 100;
	}

	// Convert slider position to volume
	function positionToVolume(position: number): number {
		return Math.max(0, Math.min(1, position / 100));
	}

	// Handle mouse down on slider
	function handleMouseDown(event: MouseEvent) {
		isDragging = true;
		updateVolume(event);

		// Add global mouse handlers
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		event.preventDefault();
	}

	// Handle mouse move during drag
	function handleMouseMove(event: MouseEvent) {
		if (!isDragging || !sliderElement) return;
		updateVolume(event);
	}

	// Handle mouse up
	function handleMouseUp() {
		isDragging = false;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	// Update volume based on mouse position
	function updateVolume(event: MouseEvent) {
		if (!sliderElement) return;

		const rect = sliderElement.getBoundingClientRect();
		const y = rect.bottom - event.clientY; // Inverted for vertical slider
		const position = Math.max(0, Math.min(100, (y / rect.height) * 100));
		const newVolume = positionToVolume(position);

		// Unmute if volume is changed from 0
		if (isMuted && newVolume > 0) {
			onMutedChange(false);
		}

		onVolumeChange(newVolume);
	}

	// Format volume for display
	function formatVolume(vol: number): string {
		return `${Math.round(vol * 100)}%`;
	}
</script>

<div class="volume-control">
	<!-- Volume Display -->
	<div class="volume-display">
		<span class="volume-value">{formatVolume(volume)}</span>
	</div>

	<!-- Vertical Slider -->
	<div
		class="volume-slider"
		bind:this={sliderElement}
		on:mousedown={handleMouseDown}
		role="slider"
		tabindex="0"
		aria-label="Volume"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={Math.round(volume * 100)}
	>
		<!-- Slider track -->
		<div class="slider-track"></div>

		<!-- Volume fill -->
		<div
			class="slider-fill"
			style="height: {volumeToPosition(isMuted ? 0 : volume)}%"
		></div>

		<!-- Slider thumb -->
		<div
			class="slider-thumb {isDragging ? 'dragging' : ''}"
			style="bottom: {volumeToPosition(isMuted ? 0 : volume)}%"
		></div>
	</div>

	<!-- Mute Button -->
	<button
		class="mute-button"
		on:click={() => onMutedChange(!isMuted)}
		title={isMuted ? 'Unmute' : 'Mute'}
	>
		{#if isMuted}
			<!-- Muted icon -->
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
				<line x1="23" y1="9" x2="17" y2="15"></line>
				<line x1="17" y1="9" x2="23" y2="15"></line>
			</svg>
		{:else}
			<!-- Volume icon -->
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
				<path d="M19.07,4.93a10,10,0,0,1,0,14.14M15.54,8.46a5,5,0,0,1,0,7.07"></path>
			</svg>
		{/if}
	</button>
</div>

<style>
	.volume-control {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 10px 8px;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 12px;
		backdrop-filter: blur(12px);
		border: none;
		min-width: 44px;
		box-shadow: 0 8px 24px rgba(0,0,0,0.5);
	}

	.volume-display {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.7);
		text-align: center;
		min-height: 16px;
	}

	.volume-value {
		color: #ffffff;
		font-weight: 500;
		font-family: monospace;
	}

	.volume-slider {
		position: relative;
		width: 20px;
		height: 80px;
		cursor: pointer;
		padding: 0 6px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.slider-track {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 3px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
		left: 50%;
		transform: translateX(-50%);
	}

	.slider-fill {
		position: absolute;
		bottom: 0;
		width: 3px;
		background: #ffffff;
		border-radius: 2px;
		left: 50%;
		transform: translateX(-50%);
		transition: height 0.1s ease;
	}

	.slider-thumb {
		position: absolute;
		width: 10px;
		height: 10px;
		background: #ffffff;
		border-radius: 50%;
		left: 50%;
		transform: translate(-50%, 50%);
		cursor: grab;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0,0,0,0.3);
		border: none;
	}

	.slider-thumb:hover {
		transform: translate(-50%, 50%) scale(1.2);
		box-shadow: 0 4px 12px rgba(0,0,0,0.4);
	}

	.slider-thumb.dragging {
		cursor: grabbing;
		transform: translate(-50%, 50%) scale(1.3);
		box-shadow: 0 6px 16px rgba(0,0,0,0.5);
	}

	.mute-button {
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		padding: 6px;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mute-button:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
		transform: scale(1.1);
	}
</style>