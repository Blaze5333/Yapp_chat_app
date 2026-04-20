import mongoose,{Schema,type Document} from "mongoose";
export interface IChat extends Document{
    participants:mongoose.Types.ObjectId[];
    createdAt:Date;
    updatedAt:Date;
    lastMessage?:mongoose.Types.ObjectId;
    lastMessageAt?:Date;
}
const ChatSchema=new Schema<IChat>({
    participants:[
        {
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    ],
    lastMessage:{
        type:Schema.Types.ObjectId,
        ref:"Message",
        required:false
    },
    lastMessageAt:{
        type:Date,
        required:false,
        default:Date.now
    }
},{
    timestamps:true
});

export const Chat=mongoose.model<IChat>("Chat",ChatSchema);