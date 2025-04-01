import { GameFunction,ExecutableGameFunctionResponse,ExecutableGameFunctionStatus } from "@virtuals-protocol/game";
import axios from "axios";
import { parseArgs } from "util";
import { logger } from "../../../deskExchangePlugin/__test__/log";
import { title } from "process";
import { text } from "stream/consumers";
import { log } from "console";

export const fetchRedditFunction = new GameFunction({
    name:"fetch_reddit_trending",
    description:"Fetch trending topics from Reddit",
    args:[
        {
            name:"subreddit",
            description:"Subreddit to fetch from, use 'all' for r/all or specify like 'news', 'worldnews', etc."
        },
        {
            name:"limit",
            description:"Number of posts to fetch (default: 10)"
        }
    ] as const,
    executable:async(args,logger)=>{
        try{
            const subreddit = args.subreddit||'all';
            const limit = args.limit||10;
            logger(`Fetching ${limit} trending posts from r/${subreddit}...`)

            const response = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`);
            if(!response.data||!response.data.data||!response.data.data.children){
                throw new Error("Invailid response format from Reddit");

            }
            const posts = response.data.data.children.map((child:any)=>{
                const post = child.data;
                return {
                    id:post.id,
                    title:post.title,
                    url : `https://reddit.com${post.permalink}`,
                    author:post.author,
                    score:post.score,
                    num_comments:post.num_comments,
                    created_utc:post.created_utc,
                    text:post.selftext,
                    is_video:post.is_video,
                    source:"reddit",
                    subreddit:post.subreddit
                };
            });
            logger(`Successfully fetched ${posts.length} posts from Reddit`);
            return new ExecutableGameFunctionResponse(ExecutableGameFunctionStatus.Done,JSON.stringify(posts));
        } catch(error){
            const errorMessage = error instanceof Error ? error.message: String(error);
            logger(`Error fetching Reddit data : ${errorMessage}`);
            return new ExecutableGameFunctionResponse(ExecutableGameFunctionStatus.Failed,`failed to fetch Reddit Data ${errorMessage}`);

        }
    }
})