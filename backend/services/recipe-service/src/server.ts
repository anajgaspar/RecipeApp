import "dotenv/config";
import express from "express";
import cors from "cors";
import recipeRoutes from "./routes/recipeRoutes";

const api = express();
const port = Number(process.env.PORT) || 3002;

api.use(express.json());
api.use(cors());

api.use("/api", recipeRoutes);

api.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

if (require.main === module) {
    api.listen(port, () => {
        console.log(`Server running in port ${port}...`);
    });
}

export default api;