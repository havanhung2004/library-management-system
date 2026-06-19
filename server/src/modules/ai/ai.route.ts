import express from "express";
import aiController from "./ai.controller";
import auth from "../../common/middlewares/auth";

const router = express.Router();

router.use(auth());

router.post("/chat", aiController.chat);

router.get("/recommendations", aiController.getRecommendations);

export default router;
