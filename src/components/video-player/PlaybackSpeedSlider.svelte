<script lang="ts">
	interface Props {
		playbackRate: number;
		onSpeedChange: (speed: number) => void;
	}

	let { playbackRate, onSpeedChange }: Props = $props();

	// Slider state
	let isDragging = $state(false);
	let sliderElement: HTMLDivElement;

	// Speed range: 0.25x to 3.0x
	const minSpeed = 0.25;
	const maxSpeed = 3.0;

	// Convert speed to slider position (0-100%)
	function speedToPosition(speed: number): number {
		return ((speed - minSpeed) / (maxSpeed - minSpeed)) * 100;
	}

	// Convert slider position to speed
	function positionToSpeed(position: number): number {
		const speed = minSpeed + (position / 100) * (maxSpeed - minSpeed);
		// Round to nearest 0.05 for smoother control
		return Math.round(speed * 20) / 20;
	}

	// Handle mouse down on slider
	function handleMouseDown(event: MouseEvent) {
		isDragging = true;
		updateSpeed(event);

		// Add global mouse handlers
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		event.preventDefault();
	}

	// Handle mouse move during drag
	function handleMouseMove(event: MouseEvent) {
		if (!isDragging || !sliderElement) return;
		updateSpeed(event);
	}

	// Handle mouse up
	function handleMouseUp() {
		isDragging = false;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	// Update speed based on mouse position
	function updateSpeed(event: MouseEvent) {
		if (!sliderElement) return;

		const rect = sliderElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
		const newSpeed = positionToSpeed(position);

		onSpeedChange(newSpeed);
	}

	// Format speed for display
	function formatSpeed(speed: number): string {
		return `${speed.toFixed(2)}x`;
	}

	// Preset speed buttons
	const presetSpeeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
</script>

<div class="playback-speed-control">
	<!-- Speed Display -->
	<div class="speed-display">
		<span class="speed-label">Speed:</span>
		<span class="speed-value">{formatSpeed(playbackRate)}</span>
	</div>

	<!-- Slider -->
	<div
		class="speed-slider"
		bind:this={sliderElement}
		on:mousedown={handleMouseDown}
		role="slider"
		tabindex="0"
		aria-label="Playback speed"
		aria-valuemin={minSpeed}
		aria-valuemax={maxSpeed}
		aria-valuenow={playbackRate}
	>
		<!-- Slider track -->
		<div class="slider-track"></div>

		<!-- Slider thumb -->
		<div
			class="slider-thumb {isDragging ? 'dragging' : ''}"
			style="left: {speedToPosition(playbackRate)}%"
		></div>
	</div>

	<!-- Preset Buttons -->
	<div class="preset-speeds">
		{#each presetSpeeds as speed}
			<button
				class="preset-button {playbackRate === speed ? 'active' : ''}"
				on:click={() => onSpeedChange(speed)}
			>
				{formatSpeed(speed)}
			</button>
		{/each}
	</div>
</div>

<style>
	.playback-speed-control {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 12px;
		backdrop-filter: blur(12px);
		border: none;
		min-width: 280px;
		box-shadow: 0 8px 24px rgba(0,0,0,0.5);
	}

	.speed-display {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
		color: #ffffff;
	}

	.speed-label {
		color: rgba(255, 255, 255, 0.7);
		font-weight: 500;
	}

	.speed-value {
		color: #ffffff;
		font-weight: 600;
		font-size: 16px;
	}

	.speed-slider {
		position: relative;
		height: 24px;
		cursor: pointer;
		padding: 8px 0;
		display: flex;
		align-items: center;
	}

	.slider-track {
		position: absolute;
		left: 0;
		right: 0;
		height: 4px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
		top: 50%;
		transform: translateY(-50%);
	}

	.slider-thumb {
		position: absolute;
		width: 16px;
		height: 16px;
		background: #ffffff;
		border-radius: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		cursor: grab;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0,0,0,0.3);
		border: none;
	}

	.slider-thumb:hover {
		transform: translate(-50%, -50%) scale(1.2);
		box-shadow: 0 4px 12px rgba(0,0,0,0.4);
	}

	.slider-thumb.dragging {
		cursor: grabbing;
		transform: translate(-50%, -50%) scale(1.3);
		box-shadow: 0 6px 16px rgba(0,0,0,0.5);
	}

	.preset-speeds {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.preset-button {
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		padding: 6px 12px;
		border-radius: 12px;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		font-weight: 500;
	}

	.preset-button:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
		transform: translateY(-1px) scale(1.05);
	}

	.preset-button.active {
		background: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		transform: scale(1.05);
	}

	.preset-button.active:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-1px) scale(1.1);
	}
</style>