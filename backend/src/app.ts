
import express from "express";
const app=express();
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoute";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middleware/errorHandler";
import path from "path";

app.use(express.json());

app.use(clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY!,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,

}))
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok',message:"Server is running" });
});
app.use("/api/auth",authRoutes)
app.use("/api/chats",chatRoutes)
app.use("/api/messages",messageRoutes)
app.use("/api/users",userRoutes)
app.use(errorHandler)

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname, "../../web/dist")))
   app.get(/^(?!\/api).+/,(_,res)=>{
    res.sendFile(path.join(__dirname,"../../web/dist/index.html"))
   })
}
export default app