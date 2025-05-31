// backend/src/api/routes/youTubeRouter.js
import express from 'express';
import fetch from 'node-fetch'; 
import dotenv from 'dotenv';

dotenv.config(); 

const youTubeRouter = express.Router();

youTubeRouter.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    if (!API_KEY) {
      console.error("YouTube API key is not configured in .env");
      return res.status(500).json({ error: "API configuration error: YouTube API key missing" });
    }

    // Make the actual API call to Youtube
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&videoDuration=medium&videoDefinition=high&key=${API_KEY}`,
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error(`Youtube API request failed: ${searchResponse.status} - ${errorText}`);
      throw new Error(`YouTube API error: ${searchResponse.status} - ${errorText}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return res.json({ videos: [] }); // No videos found
    }

    // Get video IDs for duration lookup
    const videoIds = searchData.items.map((item) => item.id.videoId).join(",");

    // Fetch video details including duration
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`,
    );

    const videoDurations = {};
    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();
      detailsData.items?.forEach((item) => {
        // Convert ISO 8601 duration to readable format
        const duration = item.contentDetails.duration;
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        
        let hours = Number.parseInt(match[1] || 0);
        let minutes = Number.parseInt(match[2] || 0);
        let seconds = Number.parseInt(match[3] || 0);

        let formattedDuration = "";
        if (hours > 0) formattedDuration += `${hours}:`;
        formattedDuration += `${minutes.toString().padStart(hours > 0 ? 2 : 1, "0")}:`;
        formattedDuration += seconds.toString().padStart(2, "0");

        videoDurations[item.id] = formattedDuration;
      });
    }

    // Format the response for the frontend
    const formattedVideos = searchData.items.map((video) => ({
      id: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
      channel: video.snippet.channelTitle,
      duration: videoDurations[video.id.videoId] || "Unknown",
      description: video.snippet.description?.substring(0, 100) + "..." || "",
      publishedAt: video.snippet.publishedAt,
    }));

    return res.json({ videos: formattedVideos });

  } catch (error) {
    console.error("Error fetching YouTube videos:", error);

    // Fallback content in case of API failure
    const fallbackVideos = [
      {
        id: "fallback-breathing",
        title: "Guided Breathing Exercise - 5 Minutes",
        thumbnail: "https://i.ytimg.com/vi/S7P2yR5Q_2Q/mqdefault.jpg", // Example placeholder thumbnail
        channel: "Mindfulness Guides",
        duration: "5:00",
        description: "A gentle breathing exercise to calm your mind...",
        isFallback: true,
      },
      {
        id: "fallback-meditation",
        title: "Beginner's Meditation - 10 Minutes",
        thumbnail: "https://i.ytimg.com/vi/aL3Fh4YJ3eU/mqdefault.jpg", // Example placeholder thumbnail
        channel: "Calm Mind",
        duration: "10:00",
        description: "Find peace through mindful awareness...",
        isFallback: true,
      },
    ];

    return res.status(500).json({
      videos: fallbackVideos,
      fallback: true,
      error: `Failed to fetch videos: ${error.message || 'Unknown error'}`,
    });
  }
});

export default youTubeRouter;
