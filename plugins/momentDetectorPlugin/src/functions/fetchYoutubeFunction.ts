import {
    GameFunction,
    ExecutableGameFunctionResponse,
    ExecutableGameFunctionStatus
  } from "@virtuals-protocol/game";
  import axios from 'axios';
  import dotenv from 'dotenv';
  
  // Load environment variables
  dotenv.config();
  
  export const fetchYouTubeFunction = new GameFunction({
    name: "fetch_youtube_trending",
    description: "Fetch trending videos and shorts from YouTube",
    args: [
      { 
        name: "limit", 
        description: "Number of trending videos to fetch (default: 10)" 
      },
      {
        name: "region_code",
        description: "The region code for location-based trends (default: 'US')"
      },
      {
        name: "video_category",
        description: "Category of videos to fetch (default: 0 - all categories)"
      },
      {
        name: "youtube_api_key",
        description: "YouTube API key (optional if set in environment variables)"
      }
    ] as const,
    executable: async (args, logger) => {
      try {
        const limit = parseInt(args.limit as string) || 10;
        const regionCode = args.region_code || 'US';
        const videoCategoryId = args.video_category || '0';
        const apiKey = args.youtube_api_key || process.env.YOUTUBE_API_KEY;
        
        if (!apiKey) {
          throw new Error("YouTube API key is required but not provided");
        }
        
        logger(`Fetching ${limit} trending videos from YouTube`);
        
        // Call the YouTube API for trending videos
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${regionCode}&maxResults=${limit}&videoCategoryId=${videoCategoryId}&key=${apiKey}`;
        
        const response = await axios.get(url);
        
        if (!response.data || !response.data.items) {
          throw new Error("Invalid response format from YouTube API");
        }
        
        // Process the response to extract relevant data
        const videos = response.data.items.map((video: any, index: number) => {
          const snippet = video.snippet || {};
          const statistics = video.statistics || {};
          const contentDetails = video.contentDetails || {};
  
          // Check if it's a short video (less than 60 seconds)
          const isShort = parseDuration(contentDetails.duration) < 60;
          
          return {
            id: `youtube-${video.id}`,
            title: snippet.title || 'Untitled',
            url: `https://www.youtube.com/watch?v=${video.id}`,
            channel: snippet.channelTitle,
            published: snippet.publishedAt,
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
            views: parseInt(statistics.viewCount) || 0,
            likes: parseInt(statistics.likeCount) || 0,
            comments: parseInt(statistics.commentCount) || 0,
            description: snippet.description || '',
            duration: contentDetails.duration,
            duration_seconds: parseDuration(contentDetails.duration),
            is_short: isShort,
            rank: index + 1,
            source: "YouTube",
            source_type: "video",
            text: `${snippet.title} - ${snippet.description}` // Combined text for sentiment analysis
          };
        });
        
        logger(`Successfully fetched ${videos.length} trending videos from YouTube`);
        
        return new ExecutableGameFunctionResponse(
          ExecutableGameFunctionStatus.Done,
          JSON.stringify(videos)
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger(`Error fetching YouTube data: ${errorMessage}`);
        
        return new ExecutableGameFunctionResponse(
          ExecutableGameFunctionStatus.Failed,
          `Failed to fetch YouTube data: ${errorMessage}`
        );
      }
    }
  });
  
  // Helper function to parse ISO 8601 duration format
  function parseDuration(duration: string): number {
    if (!duration) return 0;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }