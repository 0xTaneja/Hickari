import { GameFunction,ExecutableGameFunctionResponse,ExecutableGameFunctionStatus } from "@virtuals-protocol/game";
import axios from "axios";
import dotenv from "dotenv";
import { title } from "process";

dotenv.config();

export const fetchTwitterFunction = new GameFunction({
    name:"fetch_twitter_trending",
    description:"Fetch trending topics and tweets from Twitter/X using the official API",
    args:[
        {
            name:"limit",
            description:"Number of trending topics/tweets to fetch (default: 10)"
        },
        {
            name:"woeid",
            description:"The Where On Earth ID for location-based trends (default: 1 - worldwide)"
        },
        {
            name:"twitter_bearer_token",
            description:"Twitter Bearer Token (optional if set in environment variables)"
        }
    ] as const,
    executable:async(args,logger)=>{
        try{
            const limit = parseInt(args.limit as string)||10;
            const woeid = parseInt(args.woeid as string)||1;
            const bearerToken = args.twitter_bearer_token||process.env.TWITTER_BEARER_TOKEN;

            if(!bearerToken){
                throw new Error("Twitter Bearer Token is required but not provided")
            }
   
            logger(`Fetching ${limit} trending topics from Twitter/X`);

            const url = `https://api.twitter.com/2/trends/place.json?id=${woeid}`;
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if(!response.data||!Array.isArray(response.data)||response.data.length===0){
                throw new Error("Invalid response format from Twitter API");
            }
            const trendingTopics = response.data[0].trends.slice(0,limit);

            const formattedTrends = trendingTopics.map((trend:any,index:number)=>{
                return {
                    id:`twitter-trend-${Date.now()}-${index}}`,
                    title:trend.name,
                    url:trend.url,
                    tweet_volume:trend.tweet_volume||0,
                    rank:index+1,
                    source:"Twitter/X",
                    source_type:"social_media",
                    text:trend.name,
                    created_utc:Math.floor(Date.now()/1000)

                };
            });
            logger(`Successfully fetched ${formattedTrends.length} trending topics from Twitter/X`);
      
            return new ExecutableGameFunctionResponse(
              ExecutableGameFunctionStatus.Done,
              JSON.stringify(formattedTrends)
            );
        }
        catch(error){
            const errorMessage = error instanceof Error ? error.message : String(error);
      logger(`Error fetching Twitter data: ${errorMessage}`);
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to fetch Twitter data: ${errorMessage}`
      );
        }
    }
})