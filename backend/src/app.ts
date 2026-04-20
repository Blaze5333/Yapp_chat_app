
import express from "express";
const app=express();
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoute";

app.use(express.json());
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok',message:"Server is running" });
});
app.use("/api/auth",authRoutes)
app.use("/api/chats",chatRoutes)
app.use("/api/messages",messageRoutes)
app.use("/api/users",userRoutes)

export default app