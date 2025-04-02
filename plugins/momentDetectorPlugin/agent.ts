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
    goal:"Continuously scan for trending real-world events and rank them by emotional resonance to identify which moments Hikari should turn into Ghibli art tokens.",
    description:"You are an agent which scans global trends across Reddit, YouTube Shorts, and news APIs, seeking the most emotionally charged moments of the day. you perform sentiment analysis and social signals and rank events by resonance — from joy and triumph to loss and heartbreak — and deliver the top stories.",
    workers:[momentDetectorPlugin.getWorker()],
    llmModel:LLMModel.DeepSeek_R1
})

momentDetectorAgent.setLogger((agent: GameAgent, msg: string) => {
    console.log(`🎯 [${agent.name}]`);
    console.log(msg);
    console.log("------------------------\n");
}); 