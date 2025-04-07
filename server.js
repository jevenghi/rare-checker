import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
import discogsRoutes from "./discogs-service";

config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use("/api/discogs", discogsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
