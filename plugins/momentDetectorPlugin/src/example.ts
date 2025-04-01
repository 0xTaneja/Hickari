import { GameAgent, LLMModel } from "@virtuals-protocol/game";
import MomentDetectorPlugin from "./momentDetectorPlugin";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.API_KEY) {
  console.error("Error: API_KEY is required in .env file");
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is required in .env file");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("Warning: MONGO_URI is not set in .env file. MongoDB storage will not work.");
}

// Add warnings for other API keys
if (!process.env.GNEWS_API_KEY) {
  console.error("Warning: GNEWS_API_KEY is not set in .env file. News fetching will not work.");
}

if (!process.env.TWITTER_BEARER_TOKEN) {
  console.error("Warning: TWITTER_BEARER_TOKEN is not set in .env file. Twitter trending topics will not work.");
}

if (!process.env.YOUTUBE_API_KEY) {
  console.error("Warning: YOUTUBE_API_KEY is not set in .env file. YouTube trending videos will not work.");
}

// Create an instance of the Moment Detector Plugin with all credentials
const momentDetectorPlugin = new MomentDetectorPlugin({
  credentials: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    mongoUri: process.env.MONGO_URI,
    gnewsApiKey: process.env.GNEWS_API_KEY,
    twitterBearerToken: process.env.TWITTER_BEARER_TOKEN,
    youtubeApiKey: process.env.YOUTUBE_API_KEY
  }
});

// Create an agent with the Moment Detector worker
const agent = new GameAgent(process.env.API_KEY, {
  name: "Moment Detector Agent",
  goal: "Detect and store emotionally significant real-world moments from multiple sources",
  description: "This agent monitors Reddit, news, Twitter, and YouTube to identify emotionally impactful content and store the most significant moments.",
  workers: [momentDetectorPlugin.getWorker()],
  llmModel: LLMModel.DeepSeek_R1
});

// Set up custom logging
agent.setLogger((agent, message) => {
  console.log(`🔍 [${agent.name}]`);
  console.log(message);
  console.log("-".repeat(50) + "\n");
});

// Main execution function
async function main() {
  try {
    console.log("Initializing Moment Detector Agent...");
    await agent.init();
    
    // Get the worker by ID for direct task execution
    const worker = agent.getWorkerById(momentDetectorPlugin.getWorker().id);
    
    // Let's use a completely different approach - a single task that executes all steps
    const completeTask = `
You need to execute the following functions in sequence to detect significant moments:

Step 1: Get Reddit data
- Execute: fetch_reddit_trending({ "subreddit": "all", "limit": 10 })
- Store the result as redditPosts

Step 2: Get News data
- Execute: fetch_news({ "query": "world", "limit": 10 })
- Store the result as newsArticles

Step 3: Get YouTube data
- Execute: fetch_youtube_trending({ "limit": 10 })
- Store the result as youtubeVideos

Step 4: Combine all data
- First parse each result: JSON.parse(redditPosts), JSON.parse(newsArticles), JSON.parse(youtubeVideos)
- Then combine them into a single array called allContent
- Make sure the combined array contains valid objects from all sources

Step 5: Analyze sentiment
- Execute: analyze_sentiment({ "content": JSON.stringify(allContent) })
- Store the result as analyzedContent

Step 6: Rank moments
- Parse the analyzed content: JSON.parse(analyzedContent)
- Execute: rank_moments({ "analyzed_content": analyzedContent, "limit": 2 })
- Store the result as rankedMoments

Step 7: Store in MongoDB
- Parse the ranked moments: JSON.parse(rankedMoments)
- Execute: store_to_db({ "moments": rankedMoments })

Provide a summary of what you found after completing all steps, including:
- How many items were collected from each source
- The sentiment analysis results
- Which moments were highest ranked and why
- Confirmation of storage in MongoDB
`;
    
    console.log("Starting complete workflow...");
    try {
      await worker.runTask(completeTask, { verbose: true });
      console.log("Complete workflow finished");
    } catch (error) {
      console.error("Error executing complete workflow:", error);
    }
    
    console.log("Task execution completed.");
    
  } catch (error) {
    console.error("Error running Moment Detector Agent:", error);
  }
}

// Run the main function
main();