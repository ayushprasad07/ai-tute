import mongoose, { Schema } from "mongoose";
import User from "./User";
import Content from "./Content";


export interface IProgress {
    userId : mongoose.Schema.Types.ObjectId
    contentId : mongoose.Schema.Types.ObjectId
    status : string;
    progress : number
    createdAt : Date
    updatedAt : Date
}

const ProgressSchema = new Schema<IProgress>({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : User,
        required : true
    },
    contentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : Content,
        required : true
    },
    status : {
        type : String,
        enum : ["pending","completed"],
        default : "pending"
    },
    progress : {
        type : Number,
        default : 0
    }
}, {
    timestamps : true
});

const Progress = mongoose.models.Progress || mongoose.model('Progress',ProgressSchema);

export default Progress;