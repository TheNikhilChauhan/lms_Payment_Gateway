import express from "express";
import { configDotenv } from "dotenv";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import cookieParser from "cookie-parser";
configDotenv();
const app = express();
const PORT = process.env.PORT;

//Global rate-limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15mins
  limit: 100,
  message: "Too many requests from this IP, please try later",
});

//security middleware
app.use(ExpressMongoSanitize());
app.use(helmet());
app.use("/api", limiter);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  })
);

//logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "developement" && { stack: err.stack }),
  });
});

//

//API Routes

app.listen(PORT, () => {
  console.log(
    `The server is running on port: ${PORT} in '${process.env.NODE_ENV}' mode`
  );
});
