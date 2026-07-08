import connentdb from "./db/index.js";
import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";


connentdb()
  .then(
    () => {
      app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running on ${process.env.PORT || 8000}`)
      })
      app.on("error", (error) => {
        console.log("App Error:", error);
        throw error;
      })
    }

  )
  .catch((error) => {
    console.log(`connection failed,${error}`)
  })
// (async () => {
//   try {
//     const connectionInstance = await mongoose.connect(
//       `${process.env.MONGODB_URL}/${db_name}`
//     );

//     console.log("MongoDB Connected");
//     console.log(connectionInstance.connection.host);

//     app.on("error", (error) => {
//       console.log("App Error:", error);
//       throw error;
//     });

//     app.listen(process.env.PORT || 8000, () => {
//       console.log(`Server is running on port ${process.env.PORT || 8000}`);
//     });

//   } catch (error) {
//     console.error("MongoDB Connection Error:", error);
//     process.exit(1);
//   }
// })();