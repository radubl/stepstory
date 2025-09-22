<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { VideoBreakpoint } from '$lib/types';

	let { youtubeId, breakpoints = [] } = $props<{
		youtubeId: string;
		breakpoints?: VideoBreakpoint[];
	}>();

	// Create state variables that will be bound to parent
	let player = $state<any>(null);
	let playerReady = $state(false);

	// For binding to parent, we'll use simple props
	// The parent will use bind:player and bind:playerReady

	// Player state variables
	let playbackRate = $state(1);
	let activeBreakpoint = $state<VideoBreakpoint | null>(null);
	let loopInterval: number;

	// Custom control states
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(100);
	let isMuted = $state(false);
	let isFullscreen = $state(false);
	let progressInterval: number;
	let playerContainer: HTMLElement;

	$effect(() => {
		if (activeBreakpoint && player && playerReady) {
			setupLoop(activeBreakpoint);
		}
	});

	onMount(() => {
		// Check if window is defined (for SSR)
		if (typeof window === 'undefined') return;

		// Load YouTube API
		if (!window.YT) {
			const tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

			window.onYouTubeIframeAPIReady = initializePlayer;
		} else {
			initializePlayer();
		}

		// Setup progress tracking
		progressInterval = setInterval(() => {
			if (player && playerReady) {
				currentTime = player.getCurrentTime() || 0;
				duration = player.getDuration() || 0;
				isPlaying = player.getPlayerState() === 1;
			}
		}, 250) as unknown as number;
		
		// Set up a mutation observer to detect and remove YouTube recommendation elements
		const observer = new MutationObserver((mutations) => {
			// Store observer reference for cleanup
			if (typeof window !== 'undefined') {
				window._mutationObservers = window._mutationObservers || [];
				window._mutationObservers.push(observer);
			}
			// Get the YouTube iframe element
			const iframe = document.getElementById('youtube-player');
			if (!iframe || iframe.tagName !== 'IFRAME') return;
			
			try {
				// Try to access the iframe document
				const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
				if (!iframeDocument) return;
				
				// Elements we want to remove immediately if they appear
				const selectors = [
					'.ytp-pause-overlay', 
					'.html5-endscreen', 
					'.ytp-endscreen',
					'.ytp-related-videos-overlay',
					'.ytp-ce-element',
					'.ytp-ce-video',
					'.ytp-endscreen-content',
					'.ytp-title'
				];
				
				selectors.forEach(selector => {
					const elements = iframeDocument.querySelectorAll(selector);
					elements.forEach((el: any) => {
						if (el.parentNode) {
							try {
								el.parentNode.removeChild(el);
							} catch (err) {
								// Ignore errors
							}
						}
					});
				});
			} catch (e) {
				// Cross-origin restrictions may prevent this, which is fine
			}
		});
		
		// Start observing with configuration to catch all possible changes
		observer.observe(document, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true
		});

		// Handle keyboard events to prevent YouTube from capturing them
		const handleKeydown = (e: KeyboardEvent) => {
			// Prevent space from triggering YouTube's play/pause
			if (e.key === ' ' || e.code === 'Space') {
				e.preventDefault();
				togglePlay();
			}

			// Prevent arrow keys from triggering YouTube's seek
			if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
				e.preventDefault();

				if (e.key === 'ArrowLeft') step10Seconds(-1);
				if (e.key === 'ArrowRight') step10Seconds(1);
				if (e.key === 'ArrowUp') setVolume(Math.min(volume + 10, 100));
				if (e.key === 'ArrowDown') setVolume(Math.max(volume - 10, 0));
			}

			// Prevent 'f' from triggering YouTube's fullscreen
			if (e.key === 'f' || e.key === 'F') {
				e.preventDefault();
				toggleFullscreen();
			}

			// Prevent 'm' from triggering YouTube's mute
			if (e.key === 'm' || e.key === 'M') {
				e.preventDefault();
				toggleMute();
			}
		};

		document.addEventListener('keydown', handleKeydown);

		// Inject CSS to make sure our overlay is always on top
		const style = document.createElement('style');
		style.textContent = `
      /* Hide all YouTube UI elements */
      .ytp-pause-overlay, .ytp-chrome-top, .ytp-chrome-bottom, .ytp-gradient-top, .ytp-gradient-bottom, 
      .ytp-watermark, .ytp-iv-player-content, .ytp-ce-element, .ytp-cards-button, .ytp-watch-later-button,
      .ytp-share-button, .ytp-playlist-menu-button, .ytp-related-videos-overlay, .ytp-title-enable-channel-logo,
      .ytp-title, .ytp-title-link, .ytp-title-expanded-heading, .ytp-title-expanded-heading a, .ytp-title-text,
      .ytp-hover-progress, .ytp-thumbnail-overlay, .ytp-endscreen-content, .ytp-bezel-text-wrapper,
      .ytp-show-cards-title, .ytp-ce-expanding-overlay, .ytp-title-expanded-overlay, .ytp-suggestion-card,
      .ytp-pause-overlay-container, .ytp-pause-overlay, .ytp-share-panel, .ytp-share-panel-title,
      .ytp-offline-slate, .ytp-paid-content-overlay, .ytp-menuitem, .ytp-button:not(.ytp-chapter-title),
      .ytp-endscreen-previous, .ytp-endscreen-next, .yt-uix-button, .ytp-player-content, .annotation,
      .videowall-endscreen, .ytp-player-header, .ytp-player-footer, .ytp-button[data-tooltip-target-id="ytp-autonav-toggle-button"],
      .ytp-menu-container, .ytp-popup, .ytp-popup-container, .ytp-author, .ytp-title-expanded-title,
      .ytp-watch-later-icon, .ytp-overflow-button, .ytp-copylink-button, .caption-window, .ytp-suggested-action,
      .ytp-bezel, .ytp-scrubber-container, .ytp-scrubber-button, .ytp-progress-bar, .ytp-progress-list,
      .ytp-play-button, .ytp-mute-button, .ytp-volume-panel, .ytp-volume-slider-handle, .ytp-time-display,
      .ytp-chapter-container, .ytp-chapter-hover-container, .ytp-spinner, .ytp-ad-overlay-container, 
      .ytp-multicam-menu, .ytp-paid-content-overlay, .ytp-videowall-still, .ytp-paid-content-overlay-text,
      .ytp-ce-video, .ytp-ce-channel, .ytp-ce-playlist, .ytp-thumbnail, .ytp-ce-container, .ytp-clip-hover-container,
      .ytp-tooltip, .ytp-cards-container, .ytp-cards-teaser, .ytp-info-panel, .ytp-size-toggle-large,
      .ytp-contextmenu, .ytp-big-mode .ytp-title, .ytp-caption-window-container {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        z-index: -9999 !important;
      }
      
      /* Make sure no YouTube elements can receive focus */
      .ytp-button, .ytp-watch-later-button, .ytp-share-button, [class^="ytp-"] {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
        pointer-events: none !important;
        tabindex: -1 !important;
      }
      
      /* Make sure YouTube iframe is visible but interactions are handled by our overlay */
      iframe[src*="youtube.com"] {
        pointer-events: none !important;
        opacity: 1 !important;  /* Make sure video is visible */
        position: static !important; /* Keep it in its normal position */
        width: 100% !important;  /* Ensure proper size */
        height: 100% !important;
      }
      
      /* Allow pointer events for our custom controls */
      .video-player button, 
      .video-player input,
      .video-player select,
      .video-player .pointer-events-auto {
        pointer-events: auto !important;
        position: relative !important;
        z-index: 50 !important;
      }
      
      /* Handle fullscreen mode */
      .ytp-fullscreen, .ytp-fullscreen .html5-video-container {
        width: 100% !important;
        height: 100% !important;
      }
      
      /* Hide annotations */
      .annotation {
        display: none !important;
      }
      
      /* Hide YouTube logo */
      .branding-img-container, .branding-img {
        display: none !important;
      }
      
      /* Hide tooltips */
      .ytp-tooltip {
        display: none !important;
      }
      
      /* Hide YouTube video info */
      .ytp-title-text, .ytp-title-channel {
        display: none !important;
      }
      
      /* Hide recommendations at the end - comprehensive targeting */
      .html5-endscreen, div.html5-endscreen, .ytp-endscreen,
      .ytp-endscreen-content, .videowall-endscreen, .ytp-endscreen-previous,
      .ytp-endscreen-next, .ytp-ce-element, .ytp-ce-video, .ytp-ce-element-show,
      .ytp-ce-covering-overlay, .ytp-ce-covering-image, .ytp-ce-expanding-overlay,
      .ytp-ce-element.ytp-ce-video.ytp-ce-element-show, .ytp-autonav-endscreen-countdown-container,
      .ytp-ce-element, .ytp-ce-video, .ytp-ce-playlist, .ytp-ce-channel, .ytp-ce-playlist-icon,
      .ytp-ce-channel-icon, .ytp-pause-overlay, .ytp-upnext, .ytp-related-on-video-card {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        z-index: -9999 !important;
        pointer-events: none !important;
      }
      
      /* Hiding all YouTube elements that might appear when paused */
      .ytp-pause-overlay, .ytp-upnext, .ytp-upnext-cancel-button, .ytp-upnext-autoplay-icon, 
      .ytp-upnext-container, .ytp-upnext-autoplay-paused, .ytp-upnext-autoplay, .ytp-upnext-heading,
      .ytp-related-on-video-card, .ytp-suggested-action, .ytp-endscreen-content,
      .ytp-endscreen-title, .ytp-endscreen-channel-name, .ytp-ce-size-1280,
      .ytp-ce-size-1920, .ytp-ce-element-shadow, .ytp-ce-element-hover {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        z-index: -9999 !important;
        pointer-events: none !important;
      }
      
      /* Additional targeting for various YouTube UI states */
      body[dark], body.ytd-app, ytd-watch-flexy, #player-container-outer, #player-container-inner,
      #player-container, .html5-video-container, #container.ytd-player, .html5-main-video {
        overflow: hidden !important;
      }
    `;
		document.head.appendChild(style);

		return () => {
			clearInterval(loopInterval);
			clearInterval(progressInterval);
			document.removeEventListener('keydown', handleKeydown);
			document.head.removeChild(style);
		};
	});

	onDestroy(() => {
		clearInterval(loopInterval);
		clearInterval(progressInterval);
		
		// Clean up observer if it exists
		if (typeof window !== 'undefined') {
			window.onYouTubeIframeAPIReady = null;
			
			// Try to find and disconnect any active MutationObservers
			const observers = window._mutationObservers;
			if (Array.isArray(observers)) {
				observers.forEach(obs => {
					if (obs && typeof obs.disconnect === 'function') {
						obs.disconnect();
					}
				});
			}
		}
	});

	function initializePlayer() {
		if (typeof window === 'undefined' || !window.YT) return;

		player = new window.YT.Player('youtube-player', {
			height: '390',
			width: '640',
			videoId: youtubeId,
			playerVars: {
				playsinline: 1,
				rel: 0, // Disable related videos
				controls: 0, // Hide YouTube controls
				showinfo: 0, // Hide video title and uploader info
				modestbranding: 1, // Minimal YouTube branding
				iv_load_policy: 3, // Hide video annotations
				disablekb: 1, // Disable keyboard controls
				fs: 0, // Disable fullscreen button
				origin: window.location.origin, // Set origin for security
				widget_referrer: window.location.origin, // Additional security parameter
				enablejsapi: 1, // Enable JavaScript API
				cc_load_policy: 0, // Don't show closed captions by default
				hl: 'en', // Set UI language
				color: 'white', // Set progress bar color
				start: 0, // Start at beginning
				autohide: 1, // Hide controls when playing
				wmode: 'opaque' // Prevents z-index issues
			},
			events: {
				onReady: onPlayerReady,
				onStateChange: onPlayerStateChange,
				onError: onPlayerError
			}
		});
	}

	function onPlayerError(event: any) {
		console.error('YouTube player error:', event.data);
	}

	function onPlayerReady() {
		playerReady = true;
		duration = player.getDuration();
		volume = player.getVolume();
    
		// Get the iframe element
		const iframe = document.getElementById('youtube-player');
		if (iframe && iframe.tagName === 'IFRAME') {
			// Apply inline styles directly to the iframe to ensure nothing shows through
			iframe.style.cssText = `
				border: none !important;
				outline: none !important;
				box-shadow: none !important;
			`;
      
			// Attempt to access iframe content to apply styles directly
			try {
				const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
				if (iframeDocument) {
					// Add our style element directly into the iframe
					const iframeStyle = iframeDocument.createElement('style');
					iframeStyle.textContent = `
						/* Hide all YouTube UI elements inside iframe */
						.ytp-pause-overlay, .ytp-chrome-top, .ytp-chrome-bottom, .ytp-gradient-top, .ytp-gradient-bottom, 
						.ytp-show-cards-title, .ytp-title, .ytp-title-text, .html5-endscreen, .ytp-endscreen-content,
						.ytp-ce-element, .ytp-watch-later-button, .ytp-share-button, .ytp-watermark, .ytp-spinner,
						.ytp-thumbnail-overlay, .ytp-play-button, .ytp-big-mode .ytp-title {
							display: none !important;
							opacity: 0 !important;
							visibility: hidden !important;
							width: 0 !important;
							height: 0 !important;
							position: absolute !important;
							top: -9999px !important;
							left: -9999px !important;
							z-index: -1 !important;
						}
					`;
					iframeDocument.head.appendChild(iframeStyle);
				}
			} catch (e) {
				// Cross-origin restrictions may prevent this, which is fine
				// Our other methods will still work
				console.log('Could not inject styles directly into iframe due to cross-origin restrictions');
			}
		}
	}

	function onPlayerStateChange(event: any) {
		// Update playing state based on YouTube player state
		// YT.PlayerState values: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
		isPlaying = event.data === window.YT.PlayerState.PLAYING || event.data === window.YT.PlayerState.BUFFERING;
    
		// When video is paused (event.data === 2) or ended (event.data === 0),
		// we want to ensure our pause overlay shows to hide YouTube elements
		if (event.data === window.YT.PlayerState.PAUSED || 
			event.data === window.YT.PlayerState.ENDED) {
			
			// Force re-hiding of YouTube elements in case they've appeared
			const iframe = document.getElementById('youtube-player');
			if (iframe && iframe.tagName === 'IFRAME') {
				// First approach: try to directly access iframe content
				try {
					const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
					if (iframeDocument) {
						// Try to re-apply our styles
						const elementsToHide = iframeDocument.querySelectorAll(
							'.ytp-pause-overlay, .ytp-title, .html5-endscreen, .ytp-endscreen, ' +
							'.ytp-share-button, .ytp-watch-later-button, .ytp-related-videos-overlay, ' + 
							'.ytp-endscreen-content, .videowall-endscreen, .ytp-endscreen-previous, ' +
							'.ytp-endscreen-next, .ytp-ce-element, .ytp-ce-video, .ytp-ce-element-show, ' +
							'.ytp-ce-covering-overlay, .ytp-ce-covering-image, .ytp-ce-expanding-overlay, ' +
							'.ytp-ce-element.ytp-ce-video.ytp-ce-element-show, .ytp-autonav-endscreen-countdown-container'
						);
						
						elementsToHide.forEach((el: any) => {
							el.style.display = 'none !important';
							el.style.opacity = '0 !important';
							el.style.visibility = 'hidden !important';
							el.style.width = '0 !important';
							el.style.height = '0 !important';
							el.style.position = 'absolute !important';
							el.style.top = '-9999px !important';
							el.style.left = '-9999px !important';
							el.style.zIndex = '-9999 !important';
							el.style.pointerEvents = 'none !important';
							
							// Also remove it from DOM if possible
							if (el.parentNode) {
								try {
									el.parentNode.removeChild(el);
								} catch (err) {
									// Ignore errors from removing elements
								}
							}
						});
						
						// Also try to add a style element directly to the iframe
						const styleEl = iframeDocument.createElement('style');
						styleEl.textContent = `
							.ytp-pause-overlay, .ytp-title, .html5-endscreen, .ytp-endscreen,
							.ytp-share-button, .ytp-watch-later-button, .ytp-related-videos-overlay,
							.ytp-endscreen-content, .videowall-endscreen, .ytp-endscreen-previous,
							.ytp-endscreen-next, .ytp-ce-element, .ytp-ce-video, .ytp-ce-element-show,
							.ytp-ce-covering-overlay, .ytp-ce-covering-image, .ytp-ce-expanding-overlay,
							.ytp-ce-element.ytp-ce-video.ytp-ce-element-show, .ytp-autonav-endscreen-countdown-container {
								display: none !important;
								opacity: 0 !important;
								visibility: hidden !important;
								width: 0 !important;
								height: 0 !important;
								position: absolute !important;
								top: -9999px !important;
								left: -9999px !important;
								z-index: -9999 !important;
								pointer-events: none !important;
							}
						`;
						
						try {
							iframeDocument.head.appendChild(styleEl);
						} catch (err) {
							// Ignore errors from appending style
						}
					}
				} catch (e) {
					// Cross-origin restriction might prevent direct access
					// Use iframe sandbox approach as fallback
				}
				
				// Second approach: Make the overlay fully opaque when paused
				// This will cover up any YouTube elements that might show through
				const pauseOverlay = document.querySelector('[aria-label="Play video"]')?.closest('div');
				if (pauseOverlay) {
					pauseOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
				}
			}
		}
	}

	function setupLoop(breakpoint: VideoBreakpoint) {
		clearInterval(loopInterval);

		loopInterval = setInterval(() => {
			if (!player || !playerReady) return;

			const currentTime = player.getCurrentTime();

			if (currentTime >= breakpoint.endTime) {
				player.seekTo(breakpoint.startTime, true);
			}
		}, 500) as unknown as number;
	}

	function clearLoop() {
		clearInterval(loopInterval);
		activeBreakpoint = null;
	}

	function setPlaybackRate(rate: number) {
		if (player && playerReady) {
			player.setPlaybackRate(rate);
			playbackRate = rate;
		}
	}

	function activateBreakpoint(breakpoint: VideoBreakpoint) {
		activeBreakpoint = breakpoint;
		player.seekTo(breakpoint.startTime, true);
	}

	// Custom control functions
	function togglePlay() {
		if (!player || !playerReady) return;

		if (isPlaying) {
			player.pauseVideo();
		} else {
			player.playVideo();
		}
		isPlaying = !isPlaying;
	}

	function toggleMute() {
		if (!player || !playerReady) return;

		if (isMuted) {
			player.unMute();
			player.setVolume(volume);
		} else {
			player.mute();
		}
		isMuted = !isMuted;
	}

	function setVolume(value: number) {
		if (!player || !playerReady) return;

		volume = value;
		player.setVolume(value);
		if (value > 0 && isMuted) {
			player.unMute();
			isMuted = false;
		}
	}

	function seek(value: number) {
		if (!player || !playerReady) return;

		const seekTime = (value / 100) * duration;
		player.seekTo(seekTime, true);
		currentTime = seekTime;
	}

	function formatTime(seconds: number): string {
		if (isNaN(seconds)) return '0:00';

		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	function toggleFullscreen() {
		if (!playerContainer) return;

		if (!isFullscreen) {
			if (playerContainer.requestFullscreen) {
				playerContainer.requestFullscreen();
			} else if ((playerContainer as any).webkitRequestFullscreen) {
				(playerContainer as any).webkitRequestFullscreen();
			} else if ((playerContainer as any).msRequestFullscreen) {
				(playerContainer as any).msRequestFullscreen();
			}
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if ((document as any).webkitExitFullscreen) {
				(document as any).webkitExitFullscreen();
			} else if ((document as any).msExitFullscreen) {
				(document as any).msExitFullscreen();
			}
		}
		isFullscreen = !isFullscreen;
	}

	// Fullscreen change handler
	onMount(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('fullscreenchange', handleFullscreenChange);
			document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
			document.addEventListener('mozfullscreenchange', handleFullscreenChange);
			document.addEventListener('MSFullscreenChange', handleFullscreenChange);
		}

		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
			document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
			document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
			document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
		};
	});

	function handleFullscreenChange() {
		isFullscreen =
			!!document.fullscreenElement ||
			!!(document as any).webkitFullscreenElement ||
			!!(document as any).mozFullScreenElement ||
			!!(document as any).msFullscreenElement;
	}

	function step10Seconds(direction: number) {
		if (!player || !playerReady) return;

		const newTime = currentTime + direction * 10;
		const boundedTime = Math.max(0, Math.min(newTime, duration));
		player.seekTo(boundedTime, true);
		currentTime = boundedTime;
	}
</script>

<div
	class="video-player shadow-dark-lg border-border-dark mx-auto flex max-w-[700px] flex-col overflow-hidden rounded-xl border"
	bind:this={playerContainer}
>
	<!-- Video player with fixed aspect ratio -->
	<div class="relative w-full" style="aspect-ratio: 16/9;">
		<!-- The YouTube iframe will be injected here -->
		<div id="youtube-player" class="absolute inset-0 w-full h-full bg-black"></div>

		<!-- Main click handler overlay with highest z-index to capture all clicks -->
		<div
			class="absolute inset-0 z-50 cursor-pointer"
			style="pointer-events: auto;"
			on:click|stopPropagation={(e) => {
				e.preventDefault();
				if (player && playerReady) togglePlay();
			}}
			on:dblclick|stopPropagation={toggleFullscreen}
			aria-label="Video click area"
		></div>
		
		<!-- Custom pause overlay that only appears when paused -->
		{#if !isPlaying && playerReady}
			<div 
				class="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm pointer-events-none"
			>
				<!-- No visible button - main overlay is used for click handling -->
			</div>
		{/if}

		<!-- Progress bar overlay (stays on video) -->
		<div class="absolute bottom-0 left-0 right-0 z-60 bg-gradient-to-t from-black/80 to-transparent px-3 pt-2 pb-1 pointer-events-auto">
			<div class="relative flex items-center">
				<input
					type="range"
					min="0"
					max="100"
					value={duration ? (currentTime / duration) * 100 : 0}
					on:input={(e) => seek(parseFloat(e.currentTarget.value))}
					on:click|stopPropagation={() => {}}
					class="m-0 h-[6px] w-full cursor-pointer appearance-none rounded-full bg-white/30 p-0 outline-none
						[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:w-[14px] 
						[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
						[&::-webkit-slider-thumb]:shadow-[0_0_5px_rgba(98,0,234,0.5)] [&::-webkit-slider-thumb]:transition-all 
						[&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb:hover]:scale-[1.2] 
						[&::-webkit-slider-thumb:hover]:shadow-[0_0_10px_rgba(98,0,234,0.6)]"
				/>
			</div>
		</div>
	</div>

	<!-- Main video controls - Always visible -->
	<div class="bg-gradient-to-r from-[#1e1e2f] to-[#2d2d44] p-4 border-b border-[#3a3a5a] relative z-40 pointer-events-auto">
		<!-- Video controls -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<!-- Play/Pause button -->
				<button
					on:click={togglePlay}
					class="flex items-center justify-center w-12 h-12 rounded-full bg-primary/90 text-white 
						shadow-[0_0_15px_rgba(187,134,252,0.3)] hover:bg-primary hover:shadow-[0_0_20px_rgba(187,134,252,0.5)]
						transition-all duration-200 focus:outline-none"
					aria-label={isPlaying ? 'Pause' : 'Play'}
				>
					{#if isPlaying}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="currentColor"
						><rect x="6" y="4" width="4" height="16" rx="1" ry="1"></rect><rect
								x="14"
								y="4"
								width="4"
								height="16"
								rx="1"
								ry="1"
							></rect></svg
						>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg
						>
					{/if}
				</button>

				<!-- Step backward/forward buttons -->
				<div class="flex items-center gap-3 px-1">
					<button
						on:click={() => step10Seconds(-10)}
						class="group flex flex-col items-center justify-center hover:text-primary text-gray-300 transition-colors duration-200 focus:outline-none"
						aria-label="Backward 10 seconds"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="group-hover:scale-110 transition-transform duration-200"
						>
							<path d="m12 8-4 4 4 4" />
							<path d="M20 12H8" />
						</svg>
						<span class="text-[10px] font-medium mt-1">10s</span>
					</button>
					<button
						on:click={() => step10Seconds(10)}
						class="group flex flex-col items-center justify-center hover:text-primary text-gray-300 transition-colors duration-200 focus:outline-none"
						aria-label="Forward 10 seconds"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="group-hover:scale-110 transition-transform duration-200"
						>
							<path d="m12 8 4 4-4 4" />
							<path d="M4 12h12" />
						</svg>
						<span class="text-[10px] font-medium mt-1">10s</span>
					</button>
				</div>

				<!-- Volume control -->
				<div class="flex items-center gap-2 ml-2">
					<button
						on:click={toggleMute}
						class="hover:text-primary text-gray-300 transition-colors duration-200 focus:outline-none"
						aria-label={isMuted ? 'Unmute' : 'Mute'}
					>
						{#if isMuted || volume === 0}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							><path d="M11 5 6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line
									x1="17"
									y1="9"
									x2="23"
									y2="15"
								/></svg
							>
						{:else if volume < 50}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg
							>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							><path d="M11 5 6 9H2v6h4l5 4V5z" /><path
									d="M19.07 4.93a10 10 0 0 1 0 14.14"
								/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg
							>
						{/if}
					</button>
					<input
						type="range"
						min="0"
						max="100"
						value={volume}
						on:input={(e) => setVolume(parseFloat(e.currentTarget.value))}
						on:click|stopPropagation={() => {}}
						class="m-0 h-[4px] w-[70px] cursor-pointer appearance-none rounded-full bg-gray-500/50 p-0 outline-none
                    [&::-webkit-slider-thumb]:h-[12px] [&::-webkit-slider-thumb]:w-[12px] [&::-webkit-slider-thumb]:cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                    [&::-webkit-slider-thumb]:shadow-[0_0_3px_rgba(187,134,252,0.5)]"
					/>
				</div>

				<!-- Time display -->
				<div class="ml-2 text-sm font-medium text-gray-300 tracking-wide tabular-nums">
					{formatTime(currentTime)} <span class="text-gray-500 mx-1">/</span> {formatTime(duration)}
				</div>
			</div>

			<div class="flex items-center gap-4">
				<!-- Playback rate -->
				<div class="flex items-center gap-2">
					<span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Speed</span>
					<select
						on:change={(e) => setPlaybackRate(parseFloat(e.currentTarget.value))}
						value={playbackRate}
						class="focus:border-primary rounded-md border border-[#3a3a5a] bg-[#252538]/80 px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary/50"
					>
						<option value="0.25">0.25x</option>
						<option value="0.5">0.5x</option>
						<option value="0.75">0.75x</option>
						<option value="1">1x</option>
						<option value="1.25">1.25x</option>
						<option value="1.5">1.5x</option>
						<option value="1.75">1.75x</option>
						<option value="2">2x</option>
					</select>
				</div>

				<!-- Fullscreen button -->
				<button
					on:click={toggleFullscreen}
					class="hover:text-primary hover:bg-[#252538] flex items-center justify-center h-8 w-8 rounded-md text-gray-300 transition-colors duration-200 focus:outline-none"
					aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
				>
					{#if isFullscreen}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path
								d="M3 16h3a2 2 0 0 1 2 2v3"
							/><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg
						>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path
								d="M3 16v3a2 2 0 0 0 2 2h3"
							/><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg
						>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Playback settings and loop controls -->
	<div class="bg-dark-elevated rounded-b-xl px-6 py-4 relative z-40 pointer-events-auto">
		{#if breakpoints.length > 0}
			<div>
				<h4 class="text-dark-primary mt-0 mb-4 text-[1.1rem] font-medium flex items-center">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-primary"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>
					Loop Sections
				</h4>
				<ul class="m-0 flex list-none flex-wrap gap-3 p-0">
					{#each breakpoints as breakpoint}
						<li
							class="bg-dark-surface text-dark-primary border-border-dark shadow-dark-sm hover:bg-dark-bg hover:shadow-dark cursor-pointer rounded-lg border px-4 py-[0.6rem] font-medium
                     transition-all duration-200 hover:-translate-y-[3px]
                     {activeBreakpoint?.id === breakpoint.id
								? 'bg-primary border-primary-dark text-white shadow-[0_0_10px_rgba(98,0,234,0.3)]'
								: ''}"
							on:click={() => activateBreakpoint(breakpoint)}
						>
							{breakpoint.label || `${breakpoint.startTime}s - ${breakpoint.endTime}s`}
						</li>
					{/each}
					{#if activeBreakpoint}
						<li
							class="shadow-dark-sm from-error cursor-pointer rounded-lg border-0 bg-gradient-to-br to-[#ff5252] px-4
                    py-[0.6rem] font-medium text-white transition-all duration-200
                    hover:-translate-y-[3px] hover:shadow-[0_4px_10px_rgba(207,102,121,0.4)]"
							on:click={clearLoop}
						>
							Clear Loop
						</li>
					{/if}
				</ul>
			</div>
		{/if}
	</div>
</div>