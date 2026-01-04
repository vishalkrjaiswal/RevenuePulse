// src/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Default URI
const DEFAULT_URI = process.env.MONGO_URI;



// Exponential backoff retry parameters
const MAX_RETRIES = 10;
const INITIAL_DELAY_MS = 1000; // 1 second
let currentRetry = 0;

/**
 * Attempts to connect to MongoDB with exponential backoff retries.
 * Resolves once connected; rejects only after exhausting retries.
 */
export async function connectWithRetry(uri = DEFAULT_URI) {
  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected to ${uri}`);
    // Reset retry counter after success
    currentRetry = 0;
    return mongoose;
  } catch (err) {
    currentRetry += 1;
    const isLastAttempt = currentRetry >= MAX_RETRIES;
    console.error(
      `❌ MongoDB connection attempt ${currentRetry} failed: ${err.message}`
    );

    if (isLastAttempt) {
      console.error('⛔ MongoDB: exhausted connection retries. Giving up.');
      throw err;
    }

    const delay = INITIAL_DELAY_MS * Math.pow(2, currentRetry - 1);
    console.log(`🔄 Retrying MongoDB connection in ${delay} ms...`);
    await new Promise((res) => setTimeout(res, delay));
    return connectWithRetry(uri);
  }
}

/**
 * Optional: Attach connection event listeners for helpful debugging.
 */
export function attachConnectionListeners() {
  const c = mongoose.connection;

  c.on('connected', () =>
    console.log('🔌 Mongoose connection event: connected')
  );
  c.on('reconnected', () =>
    console.log('🔄 Mongoose connection event: reconnected')
  );
  c.on('disconnected', () =>
    console.warn('⚠️ Mongoose connection event: disconnected')
  );
  c.on('error', (err) =>
    console.error('⚠️ Mongoose connection event: error', err)
  );

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('SIGINT received: closing mongoose connection');
    await mongoose.connection.close(false);
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received: closing mongoose connection');
    await mongoose.connection.close(false);
    process.exit(0);
  });
}


export { mongoose as mongooseInstance };
