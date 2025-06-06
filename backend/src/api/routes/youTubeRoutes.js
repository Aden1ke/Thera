import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors'; // ADDED CORS SUPPORT

dotenv.config();

const youTubeRouter = express.Router();

// ADDED CORS MIDDLEWARE
youTubeRouter.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Consider tightening this to your frontend URL in production
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

youTubeRouter.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    console.warn("Youtube API: Query parameter 'q' is missing.");
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    // ENHANCED API KEY CHECK
    console.log("Backend: YouTube API Key Status:", API_KEY ? "Loaded" : "NOT LOADED - Check .env file!");

    if (!API_KEY) {
      console.error("YouTube API key missing from .env");
      return res.status(500).json({
        error: "Server configuration error",
        message: "YouTube API key not configured. Please check your .env file."
      });
    }

    // Make the actual API call to Youtube
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&videoDuration=medium&videoDefinition=high&key=${API_KEY}`,
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error(`Youtube API request failed: ${searchResponse.status} - ${errorText}`);
      try {
        const errorJson = JSON.parse(errorText);
        return res.status(searchResponse.status).json({ error: errorJson.error?.message || `YouTube API error: ${errorText}` });
      } catch (parseError) {
        return res.status(searchResponse.status).json({ error: `YouTube API error: ${errorText}` });
      }
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.log(`No YouTube videos found for query: "${query}"`);
      return res.json({ videos: [] });
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
    } else {
        const errorText = await detailsResponse.text();
        console.warn(`YouTube details API request failed: ${detailsResponse.status} - ${errorText}`);
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
    console.error("Error fetching YouTube videos in backend:", error);

    // ENHANCED FALLBACK (using more realistic fallback thumbnails)
    const fallbackVideos = [
      {
        id: "inP4QMnBDF8", // A real example ID for a breathing exercise
        title: "Guided Breathing Exercise (Fallback)",
        thumbnail: "https://img.youtube.com/vi/inP4QMnBDF8/mqdefault.jpg",
        channel: "Mindfulness Channel",
        duration: "5:00",
        description: "A gentle breathing exercise to calm your mind...",
        isFallback: true,
      },
      {
        id: "ssss7V1_eyA", // A real example ID for a meditation
        title: "Beginner's Meditation - 10 Minutes (Fallback)",
        thumbnail: "https://img.youtube.com/vi/ssss7V1_eyA/mqdefault.jpg",
        channel: "Calm Studio",
        duration: "10:00",
        description: "Find peace through mindful awareness...",
        isFallback: true,
      },
    ];

    return res.status(500).json({
      videos: fallbackVideos,
      fallback: true,
      error: `Failed to fetch videos from YouTube: ${error.message || 'Unknown error'}. Using fallback videos.`
    });
  }
});

export default youTubeRouter;
