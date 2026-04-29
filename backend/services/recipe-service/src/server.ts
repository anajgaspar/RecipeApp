import "dotenv/config";
import express from "express";
import cors from "cors";
import appRoutes from "./routes/appRoutes";

const api = express();
const port = Number(process.env.PORT) || 3002;
const bodySizeLimit = process.env.BODY_SIZE_LIMIT || "20mb";

api.use(express.json({ limit: bodySizeLimit }));
api.use(express.urlencoded({ extended: true, limit: bodySizeLimit }));
api.use(cors());

api.use("/api", appRoutes);

api.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

api.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err?.type === "entity.too.large") {
        return res.status(413).json({
            error: "Imagem muito grande",
            message: `O arquivo enviado excede o limite permitido (${bodySizeLimit}).`,
        });
    }

    return next(err);
});

if (require.main === module) {
    api.listen(port, () => {
        console.log(`Server running in port ${port}...`);
    });
}

export default api;