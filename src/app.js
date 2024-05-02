import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   })
// );

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//import routers
import userRouter from "./routes/users.routes.js";
import connectDB from "./database/db.js";
app.use("/api/v1/users", userRouter);
//http://localhost:3000/api/v1/register

export { app };
