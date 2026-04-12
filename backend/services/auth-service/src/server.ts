import "dotenv/config";
import express from "express";
import cors from 'cors';
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

const api = express();
const port = Number(process.env.PORT) || 3001;

api.use(express.json({ limit: "5mb" }));
api.use(cors());

api.use("/auth", authRoutes);
api.use("/user", userRoutes);

api.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

api.listen(port, () => {
    console.log(`Server running in port ${port}...`);
});