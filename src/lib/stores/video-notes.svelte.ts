import type { VideoConfig, VideoNote, ActiveNote } from '$lib/types/video-notes';

// Video state object
export const videoState = $state({
	config: null as VideoConfig | null,
	currentTime: 0,
	duration: 0,
	seekToTime: null as number | null
});

// Functions to update video state
export function updateVideoTime(time: number) {
	videoState.currentTime = time;
}

export function updateVideoDuration(duration: number) {
	videoState.duration = duration;
}

export function setVideoConfig(config: VideoConfig) {
	videoState.config = config;
}

// Function to seek to a specific time in the video
export function seekToVideoTime(time: number) {
	videoState.seekToTime = time;
}

// Derived function to get active notes for a given note array
export function getActiveNotes(notes: VideoNote[], currentTime: number): ActiveNote[] {
	return notes.map(note => {
		const isActive = currentTime >= note.startTime && currentTime <= note.endTime;
		const progress = isActive
			? Math.min(1, Math.max(0, (currentTime - note.startTime) / (note.endTime - note.startTime)))
			: 0;

		return {
			...note,
			isActive,
			progress
		};
	});
}

// Reactive getters for active notes
export function getActiveLeaderNotes(): ActiveNote[] {
	if (!videoState.config) return [];
	return getActiveNotes(videoState.config.leaderNotes, videoState.currentTime);
}

export function getActiveFollowerNotes(): ActiveNote[] {
	if (!videoState.config) return [];
	return getActiveNotes(videoState.config.followerNotes, videoState.currentTime);
}

// Get the currently active note (first one that's active) for scrolling purposes
export function getCurrentActiveNote(notes: VideoNote[], currentTime: number): VideoNote | null {
	return notes.find(note =>
		currentTime >= note.startTime && currentTime <= note.endTime
	) || null;
}

export function getCurrentActiveLeaderNote(): VideoNote | null {
	if (!videoState.config) return null;
	return getCurrentActiveNote(videoState.config.leaderNotes, videoState.currentTime);
}

export function getCurrentActiveFollowerNote(): VideoNote | null {
	if (!videoState.config) return null;
	return getCurrentActiveNote(videoState.config.followerNotes, videoState.currentTime);
}