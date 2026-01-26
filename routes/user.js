import express from "express";

const router = express.Router();

router.post("/login", (req, res) => {
  return res.json({ msg: "login" });
});

router.post("/signup", (req, res) => {
  return res.json({ msg: "login" });
});

export default router;
