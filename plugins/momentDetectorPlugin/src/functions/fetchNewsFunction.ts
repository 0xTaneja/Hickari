import { GameFunction,ExecutableGameFunctionResponse, ExecutableGameFunctionStatus } from "@virtuals-protocol/game";
import axios from "axios";
import { log } from "console";
import dotenv from "dotenv";

dotenv.config();



export const fetchNewsFunction = new GameFunction({
    name:"fetch_news",
    description:"Fetch trending news articles from Google News",
    args:[
        {
        name:"query",
        description: "Search query or topic for news (e.g.,world', 'technology', 'breaking')"
        },
        {
            name:"limit",
            description:"Number of news articles to fetch (default: 10)" 
        },
        {
         name:"gnews_api_key",
         description:"GNews API key (optional if set in environment)"    
        }
    ] as const,
    executable:async(args,logger)=>{
        try{
         const query = args.query||"world";
         const limit = parseInt(args.limit as string)||10;
         const apiKey = args.gnews_api_key||process.env.GNEWS_API_KEY;
         if(!apiKey){
            throw new Error("GNews API key is required but not provided")
         }
         
         logger(`Fetching ${limit} news articles about "${query}" from GNews API`);
      
         const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&max=${limit}&apikey=${apiKey}&lang=en`;
         
         const response = await axios.get(url);
         
         if (!response.data || !response.data.articles) {
           throw new Error("Invalid response format from GNews API");
         }
         
         // Process the response to extract relevant data
         const articles = response.data.articles.map((article: any) => {
           return {
             id: `gnews-${article.publishedAt}-${article.title.substring(0, 20).replace(/\s+/g, '-')}`.toLowerCase(),
             title: article.title,
             url: article.url,
             source: article.source.name,
             published: article.publishedAt,
             snippet: article.description,
             content: article.content,
             image: article.image,
             source_type: "news"
           };
         });
         
         logger(`Successfully fetched ${articles.length} news articles from GNews`);
         
         return new ExecutableGameFunctionResponse(
           ExecutableGameFunctionStatus.Done,
           JSON.stringify(articles)
         );
        }
        catch(error){
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger(`Error fetching news data: ${errorMessage}`);
            
            return new ExecutableGameFunctionResponse(
              ExecutableGameFunctionStatus.Failed,
              `Failed to fetch news data: ${errorMessage}`
            );
        }
    }
})