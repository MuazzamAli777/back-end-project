import mongoose from "mongoose";
import { db_name } from "../constant.js";


const connentdb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${db_name}`
    );

    console.log("MongoDB Connected");
    console.log(connectionInstance.connection.host);





  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
}


export default connentdb;
