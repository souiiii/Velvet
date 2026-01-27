import User from "../models/User.js";
import mongoose from "mongoose";
import { getUser } from "../utils/auth.js";

export function checkAuthSoft(req, res, next) {
  req.user = null;
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    const user = getUser(token);
    if (!user) {
      res.clearCookie("token");
      return next();
    }
    req.user = user;
    return next();
  } catch {
    res.clearCookie("token");
    return next();
  }
}

export async function checkAuthHard(req, res, next) {
  try {
    const user = req.user;
    if (!user || !user._id || !mongoose.Types.ObjectId.isValid(user._id)) {
      return res.status(401).json({ err: "Not Logged In" });
    }

    const _id = user._id;

    const userFromDb = await User.findById(_id).lean();
    if (!userFromDb) return res.status(401).json({ err: "Not Logged In" });

    req.user = userFromDb;

    return next();
  } catch (err) {
    console.log(err.message);
    return res.status(401).json({ err: "Not Logged In" });
  }
}
