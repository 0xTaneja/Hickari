import { momentDetectorAgent } from "../agent";

async function main() {
  try{
     console.log("Initializing Moment Detector Agent...");
     await momentDetectorAgent.init();

     while(true){
      await momentDetectorAgent.step({verbose:true})

     }

  }
  catch(error){
    console.error("Error running Moment Detector Agent:", error);
  }
}

main().catch(err => {
  console.error("Unhandled error in main:", err);
  process.exit(1);
});