// server.js
import dotenv from "dotenv";
dotenv.config();


import mongooseConnect from "./config/mongoose.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;

(async () => {
  try {
    // Connect to MongoDB
    await mongooseConnect(MONGODB_URI);

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

      });

    // Graceful shutdown function
    const gracefulShutdown = () => {
      console.log("⚡ SIGINT received. Shutting down gracefully...");
      server.close(async () => {
        console.log("✅ HTTP server closed");
        if (mongooseConnect.close) {
          await mongooseConnect.close(); // Close DB connection if close method exists
          console.log("✅ MongoDB connection closed");
        }
        process.exit(0);
      });
    };

    // Listen for termination signals
    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
})();
