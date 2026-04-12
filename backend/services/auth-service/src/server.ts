import "dotenv/config";
import express from "express";
import cors from 'cors';
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

const api = express();
const port = Number(process.env.PORT) || 3001;
const bodySizeLimit = process.env.BODY_SIZE_LIMIT || "15mb";

api.use(express.json({ limit: bodySizeLimit }));
api.use(express.urlencoded({ extended: true, limit: bodySizeLimit }));
api.use(cors());

api.use("/auth", authRoutes);
api.use("/user", userRoutes);

api.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

api.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err?.type === "entity.too.large") {
        return res.status(413).json({
            error: "Arquivo muito grande",
            message: `O payload excede o limite permitido (${bodySizeLimit}).`,
        });
    }

    return next(err);
});

api.listen(port, () => {
    console.log(`Server running in port ${port}...`);
});