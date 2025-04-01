import { GameFunction, ExecutableGameFunctionResponse,ExecutableGameFunctionStatus } from "@virtuals-protocol/game";

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export const analyzeSentimentFunction = new GameFunction({
    name:"analyze_sentiment",
    description:"Analyze sentiment and emotional impact of content using OpenAi",
    args:[
        {
            name:"content",
            description:"JSON string of content items to analyze"
        },
        {
            name:"openai_api_key",
            description:"OpenAI API key (optional if set in environment)"
        }
    ] as const,
    executable:async(args,logger)=>{
        try{
        const apiKey = args.openai_api_key||process.env.OPENAI_API_KEY;
        if(!apiKey){
            throw new Error("OpenAI API key is required but not provided");
        }

        let contentItems :any[];
        try {
            contentItems = JSON.parse(args.content as string);

        }catch(error){
            throw new Error ("Invalid content format: must be valid JSON array")
        }

        if (!Array.isArray(contentItems)||contentItems.length===0){
            throw new Error("Content must be a non-empty array")
        }
        logger(`Analyzing sentiment for ${contentItems.length} content items`);

        const openai = new OpenAI({apiKey});
        
        const analyzedItems = await Promise.all(
            contentItems.map(async(item)=>{
                const title = item.title||'';
                const text = item.text||item.snippet||'';

                const prompt = `
                    Analyze the emotional impact and sentiment of the following content:
                    TITLE: ${title}
                    CONTENT: ${text}
            
                    In your analysis, please provide:
                    1. A sentiment score from -10 to 10 (where -10 is extremely negative, 0 is neutral, 10 is extremely positive)
                    2. An emotional impact score from 0 to 10 (where 0 is no emotional impact, 10 is extremely impactful)
                    3. The primary emotion detected (e.g., joy, sadness, anger, fear, surprise)
                    4. A list of key emotional triggers in the content
                    5. A brief explanation of why this content might be emotionally significant
                    Return ONLY a JSON object with these fields.`;
                    

                    const response = await openai.chat.completions.create({
                        model:"gpt-4o",
                        messages:[{role:"user",content:prompt}],
                        response_format:{type:"json_object"}
                    });

                    const analysisText = response.choices[0]?.message.content || "{}";
                    let analysis;
                    
                    try {
                        analysis = JSON.parse(analysisText);

                    }
                    catch(error){
                        logger(`Error parsing OpenAI response: ${error}`);
                        analysis = {
                          sentiment_score: 0,
                          emotional_impact: 0,
                          primary_emotion: "unknown",
                          emotional_triggers: [],
                          explanation: "Failed to analyze"
                        };
                    }

                    return {
                        ...item,
                        sentiment_analysis:analysis
                    };
            
                })
            );
            logger(`Successfully analyzed sentiment for ${analyzedItems.length} items`);
      
            return new ExecutableGameFunctionResponse(
              ExecutableGameFunctionStatus.Done,
              JSON.stringify(analyzedItems)
            );
        }
        catch(error){
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger(`Error analyzing sentiment: ${errorMessage}`);
            
            return new ExecutableGameFunctionResponse(
              ExecutableGameFunctionStatus.Failed,
              `Failed to analyze sentiment: ${errorMessage}`
            );
        }
    }
})