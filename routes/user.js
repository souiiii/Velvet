import express from "express";
import validator from "validator";
import User from "../models/User.js";
import { hash, compare } from "bcrypt";

const router = express.Router();

router.post("/login", (req, res) => {
  return res.json({ msg: "login" });
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
