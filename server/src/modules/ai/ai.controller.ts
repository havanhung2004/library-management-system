import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import aiService from './ai.service';

const chat = catchAsync(async (req: Request, res: Response) => {
    const { message, history } = req.body;
    const response = await aiService.chat(message, history);
    res.status(200).send({
        success: true,
        data: response,
    });
});

const getRecommendations = catchAsync(async (req: Request, res: Response) => {
    const { context } = req.body;
    const response = await aiService.getRecommendations(context);
    res.status(200).send({
        success: true,
        data: response,
    });
});

export default {
    chat,
    getRecommendations,
};
