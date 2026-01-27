import express from "express";
import validator from "validator";
import User from "../models/User.js";
import { hash, compare } from "bcrypt";
import { setUser } from "../utils/auth.js";
import { checkAuthHard } from "../middlewares/user.js";

const router = express.Router();

router.get("/", checkAuthHard, async (req, res) => {
  return res.json({
    user: {
      fullName: req.user.fullName,
      email: req.user.email,
      userId: req.user._id,
    },
  });
});

router.post("/logout", async (req, res) => {
  req.user = null;
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({ msg: "Logged Out" });
});

router.post("/login", async (req, res) => {
  try {
    const body = req.body;

    if (!body.email) {
      return res.status(400).json({ err: "Email required" });
    }

    if (!body.password) {
      return res.status(400).json({ err: "Password required" });
    }

    if (typeof body.email !== "string" || typeof body.password !== "string")
      return res.status(400).json({ err: "Enter valid credentials" });

    const email = body.email.trim().toLowerCase();
    const password = body.password.trim();

    if (!validator.isEmail(email)) {
      return res.status(400).json({ err: "Invalid email format" });
    }

    const user = await User.findOne({ email }).lean();

    if (!user) return res.status(400).json({ err: "Invalid credentials" });

    if (!(await compare(password, user.password)))
      return res.status(400).json({ err: "Invalid credentials" });

    const payload = { _id: user._id };

    const token = setUser(payload);
    res.cookie("token", token, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });

    return res
      .status(200)
      .json({
        msg: "Login successful",
        user: { email: user.email, userId: user._id, fullName: user.fullName },
      });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "Login Failed" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const body = req.body;

    if (!body.fullName) {
      return res.status(400).json({ err: "Name required" });
    }

    if (!body.email) {
      return res.status(400).json({ err: "Email required" });
    }

    if (!body.password) {
      return res.status(400).json({ err: "Password required" });
    }

    if (
      typeof body.fullName !== "string" ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    )
      return res.status(400).json({ err: "Enter valid credentials" });

    const fullName = body.fullName.trim().toLowerCase();
    const email = body.email.trim().toLowerCase();
    const password = body.password.trim();

    if (!validator.isEmail(email)) {
      return res.status(400).json({ err: "Invalid email format" });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ err: "Email already registered" });
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!regex.test(password))
      return res
        .status(400)
        .json({ err: "Password doesn't meet the requirements" });

    const rounds = 10;

    const hashedPassword = await hash(password, rounds);

    await User.create({ fullName, email, password: hashedPassword });

    return res.status(201).json({ msg: "Signup successful" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "Internal Server Error" });
  }
});

export default router;
