import { danceStyles } from '$lib/stores/danceStyles.svelte.ts';
import { videos } from '$lib/stores/videos.svelte.ts';
import { userStore } from '$lib/stores/user.svelte.ts';
import type { DanceStyle, Video, Playlist } from '$lib/types/index';

/**
 * Converts a string to a slug format
 * @param text The text to convert to a slug
 * @returns The slugified string
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Gets a dance style by its slug
 * @param slug The slug to find the dance style by
 * @returns The dance style or undefined if not found
 */
export function getDanceStyleBySlug(slug: string): DanceStyle | undefined {
  if (!slug) return undefined;
  
  // First try to find by slug or ID
  const style = danceStyles.getAll().find(style => 
    toSlug(style.name) === slug || style.id === slug
  );
  
  if (style) return style;
  
  // If not found, try to match by ID
  if (!isNaN(Number(slug))) {
    return danceStyles.getById(slug);
  }
  
  // Still not found, try a case-insensitive partial match on the name
  return danceStyles.getAll().find(style => 
    toSlug(style.name).includes(slug) || slug.includes(toSlug(style.name))
  );
}

/**
 * Gets a video by its slug within a dance style
 * @param danceStyleId The ID of the dance style
 * @param slug The slug to find the video by
 * @returns The video or undefined if not found
 */
export function getVideoBySlug(danceStyleId: string, slug: string): Video | undefined {
  if (!danceStyleId || !slug) return undefined;
  
  // First try to find by exact slug or ID
  const video = videos.getByDanceStyle(danceStyleId).find(video => 
    toSlug(video.title) === slug || video.id === slug
  );
  
  if (video) return video;
  
  // If not found, try to match by ID
  if (!isNaN(Number(slug))) {
    const videoById = videos.getById(slug);
    if (videoById && videoById.danceStyleId === danceStyleId) {
      return videoById;
    }
  }
  
  // Still not found, try a partial match on the title
  return videos.getByDanceStyle(danceStyleId).find(video => 
    toSlug(video.title).includes(slug) || slug.includes(toSlug(video.title))
  );
}

/**
 * Gets the slug for a dance style
 * @param style The dance style to get the slug for
 * @returns The slug
 */
export function getDanceStyleSlug(style: DanceStyle | string): string {
  if (typeof style === 'string') {
    const danceStyle = danceStyles.getById(style);
    if (danceStyle) {
      return toSlug(danceStyle.name);
    }
    // If not found by ID, just return the ID as fallback
    return style;
  }
  // If we have a dance style object, return its slugified name
  return toSlug(style.name) || style.id;
}

/**
 * Gets the slug for a video
 * @param video The video to get the slug for
 * @returns The slug
 */
export function getVideoSlug(video: Video | string): string {
  if (typeof video === 'string') {
    const videoObj = videos.getById(video);
    if (videoObj) {
      return toSlug(videoObj.title);
    }
    // If not found by ID, just return the ID as fallback
    return video;
  }
  // If we have a video object, return its slugified title
  return toSlug(video.title) || video.id;
}

/**
 * Gets a playlist by its slug
 * @param slug The slug to find the playlist by
 * @returns The playlist or undefined if not found
 */
export function getPlaylistBySlug(slug: string): Playlist | undefined {
  if (!slug || !userStore.currentUser) return undefined;
  
  // First try to find by slug or ID
  const playlist = userStore.currentUser.playlists.find(playlist => 
    toSlug(playlist.name) === slug || playlist.id === slug
  );
  
  if (playlist) return playlist;
  
  // If not found, try to match by ID
  if (!isNaN(Number(slug))) {
    return userStore.getPlaylistById(slug);
  }
  
  // Still not found, try a partial match on the name
  return userStore.currentUser.playlists.find(playlist => 
    toSlug(playlist.name).includes(slug) || slug.includes(toSlug(playlist.name))
  );
}

/**
 * Gets the slug for a playlist
 * @param playlist The playlist to get the slug for
 * @returns The slug
 */
export function getPlaylistSlug(playlist: Playlist | string): string {
  if (typeof playlist === 'string') {
    const playlistObj = userStore.getPlaylistById(playlist);
    if (playlistObj) {
      return toSlug(playlistObj.name);
    }
    // If not found by ID, just return the ID as fallback
    return playlist;
  }
  // If we have a playlist object, return its slugified name
  return toSlug(playlist.name) || playlist.id;
}