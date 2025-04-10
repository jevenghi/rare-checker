import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import router from "./discogs-service.js";
import popsikeRouter from "./popsike-service.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api/discogs", router);
app.use("/api/popsike", popsikeRouter);

app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on ${PORT}`);
});
