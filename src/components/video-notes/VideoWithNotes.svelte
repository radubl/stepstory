<script lang="ts">
	import type { VideoConfig } from '$lib/types/video-notes';
	import { setVideoConfig } from '$lib/stores/video-notes.svelte.ts';
	import LocalVideoPlayer from '../video-player/LocalVideoPlayer.svelte';
	import NotesPanel from './NotesPanel.svelte';

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

<div class="h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
	<div class="flex gap-4 h-full p-4 w-full overflow-hidden">
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
</div>

