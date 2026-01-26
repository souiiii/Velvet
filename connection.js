import mongoose from "mongoose";

export async function connectToMongoDB(path) {
  return await mongoose.connect(path);
}
