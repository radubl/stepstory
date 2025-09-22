# StepStory - Dance Tutorial Application

StepStory is a web application built with SvelteKit that helps users learn dance through interactive video tutorials with enhanced learning features.

## Features

- **Enhanced Video Player**: Custom video player with variable playback speed and looping functionality for specific sections
- **Synchronized Instructions**: Step-by-step instructions for both dance leaders and followers that highlight as the video progresses
- **Visual Tempo Indicator**: Visual representation of dance beats (e.g., 1234, 5678 for bachata or 123, 567 for salsa)
- **User Profiles**: Save favorite videos and create custom playlists
- **Video Organization**: Browse by dance style, difficulty level, or specific tags
- **Content Attribution**: Each video properly attributes the original creator and dance school

## Project Structure

```
stepstory/
├── src/
│   ├── app.css                    # Global styles
│   ├── components/                # Reusable components
│   │   ├── video-player/          # Enhanced video player components
│   │   ├── tempo-indicator/       # Tempo visualization components
│   │   └── instructions/          # Synchronized instructions components
│   ├── lib/                       # Shared utilities and types
│   │   ├── api/                   # API interactions (future)
│   │   ├── stores/                # Svelte stores for state management
│   │   └── types/                 # TypeScript type definitions
│   └── routes/                    # SvelteKit routes
│       ├── +layout.svelte         # Main layout
│       ├── +page.svelte           # Home page
│       ├── dances/                # Dance styles pages
│       ├── videos/                # Video pages
│       └── profile/               # User profile pages
├── static/                        # Static assets
└── [configuration files]          # Various config files
```

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/stepstory.git
   cd stepstory
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser to `http://localhost:5173`

## Development

This project uses:
- SvelteKit for the framework
- TypeScript for type safety
- TailwindCSS for styling
- YouTube API for video embedding

## Future Enhancements

- User authentication
- Backend API for persistent data
- User-generated content and comments
- Advanced video filtering and search
- Mobile apps

## License

[MIT License](LICENSE)