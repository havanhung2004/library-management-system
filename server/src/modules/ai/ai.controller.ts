import { Request, Response } from "express";
import { catchAsync } from "../../common/utils/catchAsync";
import aiService from "./ai.service";

const chat = catchAsync(async (req: Request, res: Response) => {
  const { message, history } = req.body;
  const userId = req.user!._id;
  const response = await aiService.chat(message, history, userId.toString());
  res.status(200).send({
    success: true,
    data: response,
  });
});

const getRecommendations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const response = await aiService.getRecommendations(userId);
  res.status(200).send({
    success: true,
    data: response,
  });
});

export default {
  chat,
  getRecommendations,
};
