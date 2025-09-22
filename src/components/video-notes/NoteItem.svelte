<script lang="ts">
	import type { ActiveNote } from '$lib/types/video-notes';
	import { seekToVideoTime } from '$lib/stores/video-notes.svelte.ts';

	interface Props {
		note: ActiveNote;
		role: 'leader' | 'follower';
	}

	let { note, role }: Props = $props();

	// Format time for display
	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	// Handle click to jump to note's start time
	function handleNoteClick() {
		seekToVideoTime(note.startTime);
	}
</script>

<button
	class="note-item bg-transparent border-0 transition-all duration-300 mb-3 relative overflow-hidden cursor-pointer w-full text-left outline-none hover:opacity-90 active:scale-[0.98]"
	class:active={note.isActive}
	style="
		color: {note.isActive ? '#ffffff' : '#666666'};
		padding: {note.isActive ? '12px 16px' : '8px 12px'};
		font-size: {note.isActive ? '18px' : '13px'};
	"
	on:click={handleNoteClick}
	title="Click to jump to {formatTime(note.startTime)}"
>
	<!-- Note content -->
	<div class="relative z-[2]">
		<!-- Timestamp with progress bar -->
		<div
			class="relative mb-1 font-mono w-max"
			style="
				font-size: {note.isActive ? '11px' : '10px'};
				opacity: {note.isActive ? '0.8' : '0.5'};
				padding: 4px 8px;
			"
		>
			<!-- Progress bar for active notes - positioned behind timestamp -->
			{#if note.isActive}
				<div
					class="timestamp-progress-bar"
					style="
						position: absolute;
						top: 0;
						left: 0;
						height: 100%;
						background: rgba(255, 255, 255, 0.2);
						width: {note.progress * 100}%;
						transition: width 0.1s ease;
						z-index: -1;
						border-radius: 2px;
					"
				></div>
			{/if}
			{formatTime(note.startTime)} - {formatTime(note.endTime)}
		</div>

		<!-- Note text -->
		<div
			style="
				line-height: {note.isActive ? '1.6' : '1.4'};
				font-weight: {note.isActive ? '700' : '400'};
			"
		>
			{note.text}
		</div>
	</div>
</button>

