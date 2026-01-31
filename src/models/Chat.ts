import mongoose, { Schema } from "mongoose";
import Content from "./Content";


export interface IChat{
    contentId : mongoose.Schema.Types.ObjectId,
    messages : {
        role : String,
        text : String,
        createdAt : Date
    }[],
    createdAt : Date,
    updatedAt : Date
}


const ChatSchema = new Schema<IChat>({
    contentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : Content,
        required : true
    },
    messages : [
        {
            role : {
                type : String,
                required : true
            },
            text : {
                type : String,
                required : true
            },
            createdAt : {
                type : Date,
                default : Date.now
            }
        }
    ]
}, {
    timestamps : true
});

const Chat = mongoose.models.Chat || mongoose.model('Chat',ChatSchema);

export default Chat;