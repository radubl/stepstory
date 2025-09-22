<script lang="ts">
	import { onMount } from 'svelte';
	import type { VideoNote } from '$lib/types/video-notes';
	import { getActiveNotes, getCurrentActiveNote, videoState } from '$lib/stores/video-notes.svelte.ts';
	import NoteItem from './NoteItem.svelte';

	interface Props {
		notes: VideoNote[];
		title: string;
		role: 'leader' | 'follower';
		onToggle?: () => void;
		isVisible?: boolean;
	}

	let { notes, title, role, onToggle, isVisible = true }: Props = $props();

	let panelElement: HTMLDivElement;
	let notesContainerElement: HTMLDivElement;
	let isHovering = $state(false);

	// Reactive active notes using $derived
	let activeNotes = $derived(getActiveNotes(notes, videoState.currentTime));
	let currentActiveNote = $derived(getCurrentActiveNote(notes, videoState.currentTime));

	// Auto-scroll to active note (like karaoke) using $effect
	$effect(() => {
		if (currentActiveNote && notesContainerElement) {
			scrollToActiveNote(currentActiveNote);
		}
	});

	function scrollToActiveNote(activeNote: VideoNote) {
		if (!notesContainerElement) return;

		const noteElements = notesContainerElement.querySelectorAll('.note-item');
		const activeIndex = notes.findIndex(note => note.id === activeNote.id);

		if (activeIndex >= 0 && noteElements[activeIndex]) {
			const activeElement = noteElements[activeIndex] as HTMLElement;
			const container = notesContainerElement;

			// Calculate scroll position to center the active note
			const containerHeight = container.clientHeight;
			const elementTop = activeElement.offsetTop;
			const elementHeight = activeElement.offsetHeight;
			const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);

			// Smooth scroll to position
			container.scrollTo({
				top: Math.max(0, scrollTop),
				behavior: 'smooth'
			});
		}
	}


	// Count active notes for display
	let activeCount = $derived(activeNotes.filter(note => note.isActive).length);
</script>

<div
	bind:this={panelElement}
	style="padding: 24px"
	class="p-12 notes-panel w-full h-full flex flex-col bg-transparent overflow-hidden"
	class:hovering={isHovering}
	on:mouseenter={() => isHovering = true}
	on:mouseleave={() => isHovering = false}
>
	<!-- Panel Header -->
	<div class="panel-header p-6 sticky top-0 z-10 bg-transparent">
		<button
			class="header-button flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer text-white text-xl font-bold outline-none"
			on:click={onToggle}
			title={isVisible ? `Hide ${title}` : `Show ${title}`}
		>
			<span
				class="transition-all duration-200 font-bold"
				style="
					font-size: {isVisible ? '14px' : '20px'};
					transform: rotate({isVisible ? (role === 'leader' ? '0deg' : '180deg') : (role === 'leader' ? '-90deg' : '90deg')});
					color: {isVisible ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'};
				"
			>
				{role === 'leader' ? '‹' : '›'}
			</span>
			{#if isVisible}
				{title}
			{/if}
		</button>
	</div>

	<!-- Notes Container -->
	{#if isVisible}
		<div
			bind:this={notesContainerElement}
			class="notes-container flex-1 overflow-y-auto px-6 pb-6"
			style="scroll-behavior: smooth;"
		>
			{#if notes.length === 0}
				<div class="text-center text-gray-600 italic mt-10">
					No notes available for this section
				</div>
			{:else}
				{#each activeNotes as note (note.id)}
					<NoteItem {note} {role} />
				{/each}
			{/if}
		</div>
	{/if}

</div>

<style>
	/* Hide scrollbar by default */
	.notes-container {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.notes-container::-webkit-scrollbar {
		width: 0;
		display: none;
	}

	/* Show scrollbar on hover */
	.notes-panel.hovering .notes-container {
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
		-ms-overflow-style: auto;
	}

	.notes-panel.hovering .notes-container::-webkit-scrollbar {
		width: 6px;
		display: block;
	}

	.notes-panel.hovering .notes-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.notes-panel.hovering .notes-container::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}

	.notes-panel.hovering .notes-container::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}
</style>