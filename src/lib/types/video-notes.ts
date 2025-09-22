export interface VideoNote {
	id: string;
	startTime: number;
	endTime: number;
	text: string;
	type?: 'instruction' | 'technique' | 'timing' | 'style';
}

export interface VideoConfig {
	videoId: string;
	title: string;
	videoPath: string;
	leaderNotes: VideoNote[];
	followerNotes: VideoNote[];
	breakpoints?: Array<{
		id: string;
		startTime: number;
		endTime: number;
		label: string;
	}>;
}

export interface ActiveNote extends VideoNote {
	isActive: boolean;
	progress: number; // 0-1, how far through the note we are
}