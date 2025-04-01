import { GameFunction,ExecutableGameFunctionResponse, ExecutableGameFunctionStatus } from "@virtuals-protocol/game";
import { parseArgs } from "util";


export const rankMomentsFunction = new GameFunction({
    name:"rank_moments",
    description:"Rank content items by emotional impact and significance to find key moments ",
    args:[
        {
            name:"analyzed_content",
            description:"JSON string of content items with sentiment analysis "
        },
        {
            name:"limit",
            description:"Number of top moments to return (default:2)"
        }
    ] as const,
    executable:async(args,logger)=>{
        try{
            let analyzedItems: any[]; // Use colon for type annotation
            try {
                analyzedItems = JSON.parse(args.analyzed_content as string);
            }
            catch(error) {
                throw new Error("Invalid Analyzed Content Format : must be valid JSON array ");
            }
            if(!Array.isArray(analyzedItems)||analyzedItems.length===0)
            {
                throw new Error("Analyzed content must be a non-empty array");
            }

            const limit = parseInt(args.limit as string)||2;
            logger(`Ranking ${analyzedItems.length} content items to find top ${limit} moments`);

            const scoredItems = analyzedItems.map(item=>{
                const sentimentScore = Math.abs(item.sentiment_analysis?.sentiment_score||0);
                const emotionalImpact = item.sentiment_analysis?.emotional_impact||0;

                const combinedScore = (sentimentScore*0.7)+(emotionalImpact*0.3);
                return {
                    ...item,
                    moment_score: combinedScore
                  };
            });

            
          const rankedItems = scoredItems.sort((a, b) => b.moment_score - a.moment_score);
      
    
         const topMoments = rankedItems.slice(0, limit);
      
      
         const rankedMoments = topMoments.map((item, index) => ({
        ...item,
        rank: index + 1
        }));
      
      logger(`Successfully ranked moments and selected top ${rankedMoments.length}`);
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify(rankedMoments)
      );
    }
    catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger(`Error ranking moments: ${errorMessage}`);
        
        return new ExecutableGameFunctionResponse(
          ExecutableGameFunctionStatus.Failed,
          `Failed to rank moments: ${errorMessage}`
        );
    }
    }
})