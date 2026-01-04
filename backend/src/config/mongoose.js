// src/config/connect.js
import mongoose from 'mongoose';

export default async function connect(uri) {
  if (!uri) throw new Error('MongoDB URI is required');

  // Disable strictQuery warning in Mongoose
  mongoose.set('strictQuery', false);

  // Connect to MongoDB
  await mongoose.connect(uri);

  // Connection event listeners
  mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to', uri);
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected');
  });

  return mongoose;
}
