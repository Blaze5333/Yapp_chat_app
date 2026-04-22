import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { Chat } from "../model/Chat";
import { Message } from "../model/Message";

export async function getMessages(req:AuthRequest,res:Response,next:NextFunction){
try {
    const userId=req.userId;
    const chatId=req?.params?.chatId;
    const chat=await Chat.findOne({
        _id:chatId,
        participants:userId
    });
    if(!chat){
        res.status(404).json({message:"Chat not found"})
     return
    }
    const messages=await Message.find({chat:chatId}).populate("sender","name email avatar").sort({createdAt:1});
    res.status(200).json(messages);

} catch (error) {
    res.status(500)
    next(error)
}
}