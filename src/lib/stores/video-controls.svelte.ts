import type { VideoBreakpoint } from '$lib/types/video-notes';

export interface LoopSegment {
	start: number;
	end: number;
}

export class VideoControlsState {
	// Core video state
	currentTime = $state(0);
	duration = $state(0);
	isPlaying = $state(false);
	volume = $state(1);
	isMuted = $state(false);
	playbackRate = $state(1);
	bufferedRanges: TimeRanges | null = $state(null);

	// Timeline interaction state
	isDragging = $state(false);
	dragTarget: 'scrubber' | 'loopStart' | 'loopEnd' | null = $state(null);
	hoverTime: number | null = $state(null);
	hoverX = $state(0);

	// Loop and breakpoint state
	loopSegment: LoopSegment | null = $state(null);
	isLooping = $state(false);
	breakpoints = $state<VideoBreakpoint[]>([]);
	activeBreakpoints = $state(new Set<string>());

	// Speed control state
	showSpeedControl = $state(false);

	// Video element reference
	videoElement: HTMLVideoElement | null = $state(null);

	constructor() {}

	// Core video controls
	updateCurrentTime(time: number) {
		this.currentTime = time;
	}

	updateDuration(duration: number) {
		this.duration = duration;
	}

	updatePlayingState(isPlaying: boolean) {
		this.isPlaying = isPlaying;
	}

	updateVolume(volume: number) {
		this.volume = volume;
	}

	updateMutedState(isMuted: boolean) {
		this.isMuted = isMuted;
	}

	updatePlaybackRate(rate: number) {
		this.playbackRate = rate;
		if (this.videoElement) {
			this.videoElement.playbackRate = rate;
		}
	}

	updateBufferedRanges(ranges: TimeRanges | null) {
		this.bufferedRanges = ranges;
	}

	setVideoElement(element: HTMLVideoElement | null) {
		this.videoElement = element;
	}

	// Timeline interaction methods
	setDragState(isDragging: boolean, target: 'scrubber' | 'loopStart' | 'loopEnd' | null = null) {
		this.isDragging = isDragging;
		this.dragTarget = target;
	}

	setHoverState(time: number | null, x: number = 0) {
		this.hoverTime = time;
		this.hoverX = x;
	}

	// Playback control methods
	togglePlay() {
		if (!this.videoElement) return;

		if (this.isPlaying) {
			this.videoElement.pause();
		} else {
			this.videoElement.play();
		}
	}

	seek(percentage: number) {
		if (!this.videoElement) return;

		const seekTime = (percentage / 100) * this.duration;
		this.videoElement.currentTime = seekTime;
		this.currentTime = seekTime;
	}

	skip(seconds: number) {
		if (!this.videoElement) return;

		const newTime = Math.max(0, Math.min(this.currentTime + seconds, this.duration));
		this.videoElement.currentTime = newTime;
		this.currentTime = newTime;
	}

	// Speed control methods
	adjustSpeed(delta: number) {
		const newSpeed = Math.max(0.25, Math.min(3.0, this.playbackRate + delta));
		const roundedSpeed = Math.round(newSpeed * 20) / 20;
		this.updatePlaybackRate(roundedSpeed);
	}

	toggleSpeedControl() {
		this.showSpeedControl = !this.showSpeedControl;
	}

	// Breakpoint management
	toggleBreakpoint(breakpointId: string) {
		if (this.activeBreakpoints.has(breakpointId)) {
			this.activeBreakpoints.delete(breakpointId);
		} else {
			this.activeBreakpoints.add(breakpointId);
		}
		this.activeBreakpoints = new Set(this.activeBreakpoints);
	}

	addBreakpointAtCurrentTime() {
		const newBreakpoint: VideoBreakpoint = {
			id: `bp-${Date.now()}`,
			startTime: this.currentTime,
			endTime: this.currentTime,
			label: `Breakpoint at ${this.formatTime(this.currentTime)}`
		};

		this.breakpoints = [...this.breakpoints, newBreakpoint];
		this.activeBreakpoints.add(newBreakpoint.id);
		this.activeBreakpoints = new Set(this.activeBreakpoints);
	}

	// Loop management
	setLoopStart() {
		if (!this.loopSegment) {
			this.loopSegment = { start: this.currentTime, end: this.duration };
		} else {
			this.loopSegment = { ...this.loopSegment, start: this.currentTime };
		}
	}

	setLoopEnd() {
		if (!this.loopSegment) {
			this.loopSegment = { start: 0, end: this.currentTime };
		} else {
			this.loopSegment = { ...this.loopSegment, end: this.currentTime };
		}
	}

	toggleLoop() {
		if (!this.loopSegment) {
			this.loopSegment = {
				start: this.currentTime,
				end: Math.min(this.currentTime + 10, this.duration)
			};
			this.isLooping = true;
		} else {
			this.isLooping = !this.isLooping;
		}
	}

	clearLoop() {
		this.loopSegment = null;
		this.isLooping = false;
	}

	// Utility methods
	formatTime(seconds: number): string {
		if (isNaN(seconds)) return '0:00.000';

		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		const milliseconds = Math.floor((seconds % 1) * 1000);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
	}

	getBufferedPercentage(): number {
		if (!this.videoElement || !this.duration) return 0;
		if (this.videoElement.buffered.length > 0) {
			const bufferedEnd = this.videoElement.buffered.end(this.videoElement.buffered.length - 1);
			return (bufferedEnd / this.duration) * 100;
		}
		return 0;
	}

	getCurrentTimePercentage(): number {
		if (!this.duration) return 0;
		return (this.currentTime / this.duration) * 100;
	}
}

// Global instance
export const videoControlsState = new VideoControlsState();