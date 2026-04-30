import { Socket,Server as SocketServer } from "socket.io";
import {Server as HttpServer} from "http";
import { verifyToken } from "@clerk/express";
import { Message } from "../model/Message";
import { Chat } from "../model/Chat";
import { User } from "../model/User";

const allowedOrigins=["http://localhost:8081","http://localhost:5173",process.env.FRONTEND_URL].filter(Boolean) as string[];
export const onlineUsers=new Map<string,string>();
interface SocketWithUserId extends Socket{
    userId:string;
}
export const initializeSocket=(httpServer:HttpServer)=>{
    try {
        const io=new SocketServer(httpServer,{cors:{origin:allowedOrigins}})
        io.use(async(socket,next)=>{
            try {
                const token=socket.handshake.auth.token;
                if(!token){
                    return next(new Error("Authentication error: No token provided"))
                }
                const session=await verifyToken(token,{secretKey:process.env.CLERK_SECRET_KEY as string});
                if(!session?.userId){
                    return next(new Error("Authentication error: Invalid token"))
                }
                const user=await User.findOne({clerkId:session.userId})
                if(!user){
                    return next(new Error("Authentication error: User not found"))
                }
                (socket as SocketWithUserId).userId=user._id.toString();
                next();
            } catch (error) {
                console.error("Socket authentication error:",error);
                next(new Error("Authentication error"))
            }
        })
        io.on("connection",(socket)=>{
            const userId=(socket as SocketWithUserId).userId;
            //send list of currently active users to the newly connected user
            socket.emit("online-users",{userIds:Array.from(onlineUsers.keys())})
            onlineUsers.set(userId,socket.id);
            socket.broadcast.emit("user-online",{userId})
            socket.join('user-'+userId);
            socket.on("join-chat",async({chatId}:{chatId:string})=>{
                socket.join('chat-'+chatId);
            })
            socket.on("leave-chat",async({chatId}:{chatId:string})=>{
                socket.leave('chat-'+chatId);
            })
            socket.on("send-message",async(data:{chatId:string;text:string})=>{
                try {
                    const chat=await Chat.findOne({_id:data.chatId,participants:userId});
                    if(!chat){
                        return socket.emit("error",{message:"Chat not found or access denied"})
                    }
                    const message=await Message.create({
                        chat:data.chatId,
                        sender:userId,
                        text:data.text,
                    })
                    chat.lastMessage=message._id;
                    chat.lastMessageAt=new Date();
                    await chat.save();
                    await message.populate("sender","name email avatar");
                    io.to('user-'+userId).emit("new-message",message);
                    io.to('chat-'+data.chatId).emit("new-message",message);
                    for (const participantId of chat.participants){
                        io.to('user-'+participantId).emit("new-message",message);
                    }
                } catch (error) {
                    socket.emit("error",{message:"Failed to send message"})
                    
                }
            })
                socket.on("disconnect",()=>{
                    onlineUsers.delete(userId);
                    socket.broadcast.emit("user-offline",{userId})
                })

        })
        return io;
    } catch (error) {
        console.error("Socket initialization error:", error);
    }
}