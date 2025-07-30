import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ashwin:ashwin@cluster0.ahgsks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

let cached = global.mongo

if (!cached) {
  cached = global.mongo = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
