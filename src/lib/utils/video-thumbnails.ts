export interface VideoThumbnail {
	time: number;
	dataUrl: string;
	width: number;
	height: number;
}

export class VideoThumbnailGenerator {
	private video: HTMLVideoElement;
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private thumbnails: VideoThumbnail[] = [];
	private isGenerating = false;

	constructor(video: HTMLVideoElement) {
		this.video = video;
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d')!;
	}

	async generateThumbnails(
		thumbnailCount: number = 20,
		thumbnailWidth: number = 160,
		thumbnailHeight: number = 90
	): Promise<VideoThumbnail[]> {
		if (this.isGenerating) {
			return this.thumbnails;
		}

		this.isGenerating = true;
		this.thumbnails = [];

		try {
			const duration = this.video.duration;
			if (!duration || duration === 0) {
				throw new Error('Video duration not available');
			}

			// Set canvas size
			this.canvas.width = thumbnailWidth;
			this.canvas.height = thumbnailHeight;

			// Generate thumbnails at evenly spaced intervals
			for (let i = 0; i < thumbnailCount; i++) {
				const time = (i / (thumbnailCount - 1)) * duration;
				const thumbnail = await this.generateThumbnailAtTime(time, thumbnailWidth, thumbnailHeight);
				this.thumbnails.push(thumbnail);
			}

			return this.thumbnails;
		} finally {
			this.isGenerating = false;
		}
	}

	private async generateThumbnailAtTime(
		time: number,
		width: number,
		height: number
	): Promise<VideoThumbnail> {
		return new Promise((resolve, reject) => {
			const originalTime = this.video.currentTime;

			const onSeeked = () => {
				try {
					// Draw video frame to canvas
					this.ctx.drawImage(this.video, 0, 0, width, height);

					// Convert canvas to data URL
					const dataUrl = this.canvas.toDataURL('image/jpeg', 0.7);

					// Restore original time
					this.video.currentTime = originalTime;

					// Remove event listener
					this.video.removeEventListener('seeked', onSeeked);

					resolve({
						time,
						dataUrl,
						width,
						height
					});
				} catch (error) {
					this.video.removeEventListener('seeked', onSeeked);
					reject(error);
				}
			};

			const onError = () => {
				this.video.removeEventListener('seeked', onSeeked);
				this.video.removeEventListener('error', onError);
				reject(new Error('Failed to seek to time: ' + time));
			};

			this.video.addEventListener('seeked', onSeeked);
			this.video.addEventListener('error', onError);

			// Seek to the target time
			this.video.currentTime = time;
		});
	}

	getThumbnails(): VideoThumbnail[] {
		return this.thumbnails;
	}

	getThumbnailAtTime(time: number): VideoThumbnail | null {
		if (this.thumbnails.length === 0) return null;

		// Find the closest thumbnail
		let closest = this.thumbnails[0];
		let minDiff = Math.abs(time - closest.time);

		for (const thumbnail of this.thumbnails) {
			const diff = Math.abs(time - thumbnail.time);
			if (diff < minDiff) {
				minDiff = diff;
				closest = thumbnail;
			}
		}

		return closest;
	}

	clear() {
		this.thumbnails = [];
	}
}