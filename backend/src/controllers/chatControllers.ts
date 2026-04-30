import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { Chat } from "../model/Chat";
import mongoose from "mongoose";

export async function getAllChats(req:AuthRequest,res:Response,next:NextFunction){
    try {
        const userId=req.userId;
        const chats=await Chat.find({participants:userId})
        .populate("participants","name email avatar")
        .populate("lastMessage")
        .sort({lastMessageAt:-1});
         const formattedChats=chats.map(chat=>{
            const otherParticipant=chat.participants.find(p=>p._id.toString()!==userId);
            return {
                _id:chat._id,
                participant:otherParticipant,
                lastMessage:chat.lastMessage,
                lastMessageAt:chat.lastMessageAt
            }
         })
        res.status(200).json(formattedChats);
    } catch (error) {
        res.status(500)
        next(error)
    }
}

export async function getOrCreateChat(req:AuthRequest,res:Response,next:NextFunction){
    try {
        const userId=req.userId;
        const {participantId}=req.params;
        if(!participantId){
            return res.status(400).json({message:"Invalid participant ID"})
         }
        let chat=await Chat.findOne({
            participants:{$all:[userId,participantId]},
        }).populate("participants","name email avatar")
        if(!chat){
            //logic left to send email notification to the participant about the new chat/ request

            const newChat= new Chat({
                participants:[userId,participantId]
            })
            await newChat.save();
            chat=await newChat.populate("participants","name email avatar")
        }
        const otherParticipant=chat.participants.find(p=>p._id.toString()!==userId);

        res.status(200).json({
            _id:chat._id,
            participant:otherParticipant??null,
            lastMessage:chat.lastMessage,
            lastMessageAt:chat.lastMessageAt
        });
    }catch (error) {
        res.status(500)
        next(error)
    }
}