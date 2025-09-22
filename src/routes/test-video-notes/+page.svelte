<script lang="ts">
	import { onMount } from 'svelte';
	import type { VideoConfig } from '$lib/types/video-notes';
	import VideoWithNotes from '$lib/../components/video-notes/VideoWithNotes.svelte';

	let videoConfig: VideoConfig | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const response = await fetch('/configs/sample-dance-lesson.json');
			if (!response.ok) {
				throw new Error(`Failed to load config: ${response.statusText}`);
			}
			videoConfig = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load video configuration';
			console.error('Error loading video config:', err);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Video Notes Test - StepStory</title>
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Loading video configuration...</p>
	</div>
{:else if error}
	<div class="error-container">
		<div class="error-icon">⚠️</div>
		<h2>Failed to Load Video</h2>
		<p>{error}</p>
		<button on:click={() => window.location.reload()}>Retry</button>
	</div>
{:else if videoConfig}
	<VideoWithNotes config={videoConfig} />
{:else}
	<div class="error-container">
		<div class="error-icon">❌</div>
		<h2>No Video Configuration Found</h2>
		<p>The video configuration could not be loaded.</p>
	</div>
{/if}

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%);
		color: #e1e1e1;
	}

	.loading-spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgba(187, 134, 252, 0.2);
		border-top: 4px solid #bb86fc;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 16px;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%);
		color: #e1e1e1;
		text-align: center;
		padding: 32px;
	}

	.error-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	.error-container h2 {
		color: #ff6b6b;
		margin: 0 0 16px 0;
		font-size: 24px;
	}

	.error-container p {
		color: #b0b0b0;
		margin: 0 0 24px 0;
		max-width: 400px;
		line-height: 1.5;
	}

	.error-container button {
		background: linear-gradient(135deg, #bb86fc 0%, #9d46ff 100%);
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.error-container button:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(187, 134, 252, 0.3);
	}
</style>