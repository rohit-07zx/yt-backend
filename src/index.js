import dotenv from "dotenv";
import connectDB from "./database/db.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});
await connectDB();

app.listen(process.env.PORT, () => {
  console.log("!! server started!" + process.env.PORT);
});
