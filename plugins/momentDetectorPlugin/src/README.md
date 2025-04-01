# Moment Detector Plugin for Virtuals Game

This plugin allows Game agents to detect emotionally significant real-world moments from various content sources. It analyzes content from platforms like Reddit and news services, ranks them based on emotional impact, and stores the most significant moments.

## Features

- Fetch trending content from Reddit
- Fetch news articles from various sources
- Analyze sentiment and emotional impact using OpenAI
- Rank content by emotional significance
- Store top moments in MongoDB

## Installation

To install the plugin, use npm or yarn:

```bash
npm install @virtuals-protocol/game-moment-detector-plugin
```

or

```bash
yarn add @virtuals-protocol/game-moment-detector-plugin
```

## Usage

### Importing the Plugin

First, import the `MomentDetectorPlugin` class from the plugin:

```typescript
import MomentDetectorPlugin from "@virtuals-protocol/game-moment-detector-plugin";
```

### Creating a Worker

Create a worker with the necessary credentials:

```typescript
const momentDetectorPlugin = new MomentDetectorPlugin({
  credentials: {
    openaiApiKey: "your_openai_api_key",
    mongoUri: "your_mongodb_connection_string"
  }
});
```

### Creating an Agent

Create an agent and add the worker to it:

```typescript
import { GameAgent } from "@virtuals-protocol/game";

const agent = new GameAgent("GAME_API_KEY", {
  name: "Moment Detector Agent",
  goal: "Detect and store emotionally significant moments from online content",
  description: "An agent that monitors online content to identify significant moments",
  workers: [momentDetectorPlugin.getWorker()]
});
```

### Running the Agent

Initialize and run the agent:

```typescript
(async () => {
  await agent.init();
  
  // Get the worker by ID
  const worker = agent.getWorkerById(momentDetectorPlugin.getWorker().id);
  
  // Run a specific task
  await worker.runTask(
    "Find emotionally significant moments from Reddit r/worldnews and store the top 2 moments",
    { verbose: true }
  );
})();
```

## Available Functions

The `MomentDetectorPlugin` provides several functions that can be used by the agent:

1. `fetch_reddit_trending`: Fetch trending posts from Reddit
2. `fetch_news`: Fetch news articles from various sources
3. `analyze_sentiment`: Analyze sentiment and emotional impact of content
4. `rank_moments`: Rank content items by emotional significance
5. `store_to_db`: Store ranked moments in MongoDB

## Environment Variables

The plugin uses the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `MONGO_URI`: Your MongoDB connection string

## License

This project is licensed under the MIT License.