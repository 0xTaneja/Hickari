import { GameAgent, LLMModel } from "@virtuals-protocol/game";
import dotenv from "dotenv"
import MomentDetectorPlugin from "./src";

dotenv.config();

if(!process.env.API_KEY){
    throw new Error("API_KEY is required in environment variables");
}

const momentDetectorPlugin = new MomentDetectorPlugin({
    credentials: {
      openaiApiKey: process.env.OPENAI_API_KEY||"",
      mongoUri: process.env.MONGO_URI,
      gnewsApiKey: process.env.GNEWS_API_KEY,
      twitterBearerToken: process.env.TWITTER_BEARER_TOKEN,
      youtubeApiKey: process.env.YOUTUBE_API_KEY
    }
  });

export const momentDetectorAgent = new GameAgent(process.env.API_KEY,{
    name:"Moment Detector Agent",
    goal:"Complete these specific steps in order: 1) Fetch content from Reddit, 2) Fetch news from GNews API, 3) Fetch content from YouTube, 4) Analyze sentiment of all collected content, 5) Rank moments by emotional impact, 6) Store top results in MongoDB.",
    description:"You are an agent that must follow a strict workflow to detect emotionally significant moments. Your process must be: First collect content from Reddit (r/news, r/worldnews, r/UpliftingNews). Next collect news from GNews API. Then get content from YouTube. Once ALL content is collected, analyze the sentiment of EACH item using the sentiment analysis function. Then rank all items by emotional impact. Finally, store the top ranked moments in MongoDB. You MUST complete each step fully before moving to the next step.",
    workers:[momentDetectorPlugin.getWorker()],
    llmModel:LLMModel.DeepSeek_R1
})

momentDetectorAgent.setLogger((agent: GameAgent, msg: string) => {
    console.log(`🎯 [${agent.name}]`);
    console.log(msg);
    console.log("------------------------\n");
}); 