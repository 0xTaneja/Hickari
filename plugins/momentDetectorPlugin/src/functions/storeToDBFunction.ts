import {
    GameFunction,
    ExecutableGameFunctionResponse,
    ExecutableGameFunctionStatus
  } from "@virtuals-protocol/game";
  import mongoose from "mongoose";
  import dotenv from "dotenv";
  
  // Load environment variables
  dotenv.config();
  
  // Define Moment schema
  const momentSchema = new mongoose.Schema({
    title: String,
    url: String,
    source: String,
    text: String,
    sentiment_analysis: Object,
    moment_score: Number,
    rank: Number,
    stored_at: { type: Date, default: Date.now },
    day_id: String
  }, { strict: false });
  
  export const storeToDBFunction = new GameFunction({
    name: "store_to_db",
    description: "Store ranked moments in MongoDB using Mongoose",
    args: [
      { 
        name: "moments", 
        description: "JSON string of ranked moments to store" 
      },
      { 
        name: "mongo_uri", 
        description: "MongoDB URI (optional if set in environment variables)" 
      },
      { 
        name: "database_name", 
        description: "MongoDB database name (default: 'moments_db')" 
      },
      { 
        name: "collection_name", 
        description: "MongoDB collection name (default: 'moments')" 
      }
    ] as const,
    executable: async (args, logger) => {
      try {
        // Get MongoDB connection details
        const mongoUri = args.mongo_uri || process.env.MONGO_URI;
        if (!mongoUri) {
          throw new Error("MongoDB URI is required but not provided");
        }
        
        const dbName = args.database_name || "moments_db";
        const collectionName = args.collection_name || "moments";
        
        // Parse the moments
        let moments: any[];
        try {
          moments = JSON.parse(args.moments as string);
        } catch (e) {
          throw new Error("Invalid moments format: must be valid JSON array");
        }
        
        if (!Array.isArray(moments) || moments.length === 0) {
          throw new Error("Moments must be a non-empty array");
        }
        
        logger(`Connecting to MongoDB at ${mongoUri.split('@')[1] || '[hidden]'}`);
        
        // Connect to MongoDB using Mongoose
        await mongoose.connect(`${mongoUri}/${dbName}`);
        
        // Create or get the model
        const Moment = mongoose.models[collectionName] || 
                       mongoose.model(collectionName, momentSchema);
        
        // Add timestamp to each moment
        const timestampedMoments = moments.map(moment => ({
          ...moment,
          stored_at: new Date(),
          day_id: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        }));
        
        // Insert moments into the database
        const result = await Moment.insertMany(timestampedMoments);
        
        logger(`Successfully stored ${result.length} moments in MongoDB`);
        
        // Close the connection
        await mongoose.disconnect();
        
        return new ExecutableGameFunctionResponse(
          ExecutableGameFunctionStatus.Done,
          JSON.stringify({
            success: true,
            stored_count: result.length,
            moments_ids: result.map(doc => doc._id.toString())
          })
        );
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger(`Error storing moments in MongoDB: ${errorMessage}`);
        
        return new ExecutableGameFunctionResponse(
          ExecutableGameFunctionStatus.Failed,
          `Failed to store moments in MongoDB: ${errorMessage}`
        );
      }
    }
  });