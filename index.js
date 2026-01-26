import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import userRouter from "./routes/user.js";
import fileRouter from "./routes/file.js";
import { connectToMongoDB } from "./connection.js";
import { checkAuthSoft } from "./middlewares/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT ?? 8000;
const MONGO_URI = process.env.MONGO_URI;

// app.use(express.static(path.join(__dirname, "client", "dist")));

app.use(checkAuthSoft);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/file", fileRouter);

// app.use((req, res) =>
//   res.sendFile(path.join(__dirname, "client", "dist", "index.html")),
// );

connectToMongoDB(MONGO_URI)
  .then(() => {
    console.log("MongoDb connected");
    app.listen(PORT, () => console.log("server started"));
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
