import { GameWorker,GameFunction } from "@virtuals-protocol/game";
import { fetchRedditFunction } from "./functions/fetchRedditFunction";
import { fetchNewsFunction } from "./functions/fetchNewsFunction";
import { analyzeSentimentFunction } from "./functions/analyzeSentimentFunction";
import { rankMomentsFunction } from "./functions/rankMomentsFunction";
import { storeToDBFunction } from "./functions/storeToDBFunction";
import { fetchTwitterFunction } from "./functions/fetchTwitterFunction";
import { fetchYouTubeFunction } from "./functions/fetchYoutubeFunction";

interface IMomentDetectorPluginOptions{
    id?:string;
    name?:string;
    description?:string;
    credentials?:{
        openaiApiKey:string;
        mongoUri?:string;
        gnewsApiKey?:string;
        twitterBearerToken?:string;
        youtubeApiKey?:string;
    };
}

class MomentDetectorPlugin{
    private id :string;
    private name:string;
    private description:string;
    private openaiApiKey?:string;
    private mongoUri:string;
    private gnewsApiKey?:string;
    private twitterBearerToken?:string;
    private youtubeApiKey?:string;


    constructor(options:IMomentDetectorPluginOptions={}){
        this.id = options.id||"moment_detector_worker";
        this.name = options.name||"Moment Detector Worker";
        this.description = options.description||"A worker that detects significant real-world moments by analyzing content from various sources.";
        this.openaiApiKey = options.credentials?.openaiApiKey;
        this.mongoUri = options.credentials?.mongoUri||"";
        this.gnewsApiKey = options.credentials?.gnewsApiKey;
        this.twitterBearerToken = options.credentials?.twitterBearerToken;
        this.youtubeApiKey = options.credentials?.youtubeApiKey;
    }

    public getWorker(data?:{
        functions?:GameFunction<any>[];
        getEnvironment?:()=>Promise<Record<string,any>>;
    }):GameWorker{
        return new GameWorker({
            id:this.id,
            name:this.name,
            description:this.description,
            functions:data?.functions||[
                fetchRedditFunction,
                fetchNewsFunction,
                fetchTwitterFunction,
                fetchYouTubeFunction,
                analyzeSentimentFunction,
                rankMomentsFunction,
                storeToDBFunction
            ],
            getEnvironment:data?.getEnvironment||(async()=>{
                return {
                    openaiApiKey:this.openaiApiKey,
                    mongoUri:this.mongoUri,
                    gnewsApiKey: this.gnewsApiKey,
                    twitterBearerToken: this.twitterBearerToken,
                    youtubeApiKey: this.youtubeApiKey
                }
            })
        })
    }
}
export default MomentDetectorPlugin;