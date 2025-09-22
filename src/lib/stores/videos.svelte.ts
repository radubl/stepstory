import type { Video } from '$lib/types';

// Sample data for initial development
const initialVideos: Video[] = [
  {
    id: '1',
    title: 'Basic Bachata Steps',
    description: 'Learn the fundamental steps of Bachata in this tutorial.',
    youtubeId: 'dQw4w9WgXcQ', // This would be a real YouTube ID in production
    danceStyleId: '1',
    creator: {
      id: '1',
      name: 'Dance Academy',
      youtubeChannel: 'https://youtube.com/danceacademy',
      danceSchool: 'International Dance Academy'
    },
    difficulty: 1,
    popularity: 4.5,
    tags: ['beginner', 'basics', 'tutorial'],
    breakpoints: [
      {
        id: 'bp1',
        startTime: 30,
        endTime: 45,
        label: 'Basic Step'
      },
      {
        id: 'bp2',
        startTime: 60,
        endTime: 75,
        label: 'Side Step'
      }
    ],
    instructions: {
      steps: [
        {
          id: 'step1',
          startTime: 30,
          endTime: 45,
          leaderInstructions: 'Step forward with left foot',
          followerInstructions: 'Step backward with right foot'
        },
        {
          id: 'step2',
          startTime: 45,
          endTime: 60,
          leaderInstructions: 'Step in place with right foot',
          followerInstructions: 'Step in place with left foot'
        }
      ]
    }
  },
  {
    id: '2',
    title: 'Intermediate Bachata Turns',
    description: 'Take your Bachata to the next level with these turn patterns.',
    youtubeId: 'xvFZjo5PgG0', // This would be a real YouTube ID in production
    danceStyleId: '1',
    creator: {
      id: '1',
      name: 'Dance Academy',
      youtubeChannel: 'https://youtube.com/danceacademy',
      danceSchool: 'International Dance Academy'
    },
    difficulty: 3,
    popularity: 4.8,
    tags: ['intermediate', 'turns', 'patterns']
  }
];

class VideoStore {
  videos = $state<Video[]>([...initialVideos]);
  
  getById(id: string): Video | undefined {
    return this.videos.find(video => video.id === id);
  }
  
  getAll(): Video[] {
    return this.videos;
  }
  
  getByDanceStyle(danceStyleId: string): Video[] {
    return this.videos.filter(video => video.danceStyleId === danceStyleId);
  }
  
  addVideo(video: Video) {
    this.videos = [...this.videos, video];
  }
  
  updateVideo(updatedVideo: Video) {
    this.videos = this.videos.map(video => 
      video.id === updatedVideo.id ? updatedVideo : video
    );
  }
  
  deleteVideo(id: string) {
    this.videos = this.videos.filter(video => video.id !== id);
  }
  
  updatePopularity(id: string, newPopularity: number) {
    this.videos = this.videos.map(video => 
      video.id === id ? {...video, popularity: newPopularity} : video
    );
  }
}

export const videos = new VideoStore();