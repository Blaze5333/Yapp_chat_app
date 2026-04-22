import type {Request,Response,NextFunction} from "express";
import {getAuth,requireAuth} from "@clerk/express";
import { User } from "../model/User";
export interface AuthRequest extends Request{
    userId?:string;
}
export const protectRoute=[
    requireAuth(),
    async(req:AuthRequest,res:Response,next:NextFunction)=>{
        try {
            const{userId:clerkId}=getAuth(req)
            if(!clerkId){
                return res.status(401).json({message:"Unauthorized"})
            }
            const user=await User.findOne({clerkId})
            if(!user)return res.status(401).json({message:"User not found"})
            req.userId=user._id.toString();
            next()
        } catch (error) {
            console.error(error);
        }
    }
]