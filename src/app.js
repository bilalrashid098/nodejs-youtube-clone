import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }) // Allow requests from the specified origin
);

app.use(express.json({ limit: "16kb" })); // limit the size of the request body
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // url encode to read params from url
app.use(express.static("public")); // to serve static files
app.use(cookieParser()); // to parse cookies

// routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js"
import tweetRouter from "./routes/tweet.routes.js"

// routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/tweet", tweetRouter);

export { app };
