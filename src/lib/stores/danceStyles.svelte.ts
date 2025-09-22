import type { DanceStyle } from '$lib/types';

// Sample data for initial development
const initialDanceStyles: DanceStyle[] = [
  {
    id: '1',
    name: 'Bachata',
    description: 'A sensual dance from the Dominican Republic characterized by Cuban hip motion and upper body movements.',
    imageUrl: '/images/bachata.jpg',
    videos: ['1', '2']
  },
  {
    id: '2',
    name: 'Salsa',
    description: 'An energetic dance style with origins in the Caribbean, particularly Cuba and Puerto Rico.',
    imageUrl: '/images/salsa.jpg',
    videos: ['3', '4']
  }
];

class DanceStyleStore {
  styles = $state<DanceStyle[]>([...initialDanceStyles]);
  
  getById(id: string): DanceStyle | undefined {
    return this.styles.find(style => style.id === id);
  }
  
  getAll(): DanceStyle[] {
    return this.styles;
  }
  
  addStyle(style: DanceStyle) {
    this.styles = [...this.styles, style];
  }
  
  updateStyle(updatedStyle: DanceStyle) {
    this.styles = this.styles.map(style => 
      style.id === updatedStyle.id ? updatedStyle : style
    );
  }
  
  deleteStyle(id: string) {
    this.styles = this.styles.filter(style => style.id !== id);
  }
}

export const danceStyles = new DanceStyleStore();