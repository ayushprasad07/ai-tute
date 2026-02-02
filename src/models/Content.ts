import mongoose, { Schema} from "mongoose";
import User from "./User";

interface IContent{
    userId : mongoose.Schema.Types.ObjectId;
    type : "youtube" | "pdf";
    title : String;
    sourceUrl ?: String;
    content ?: String;
    status : string;
    createdAt : Date;
    updatedAt : Date;
}

const ContentSchema = new Schema<IContent>({
    userId : {
        type : Schema.Types.ObjectId,
        ref : User,
        required : true
    },
    type : {
        type : String,
        enum : ["youtube", "pdf"],
        required : true
    },
    title : {
        type : String,
        required : true
    },
    sourceUrl : {
        type : String,
    },
    content : {
        type : String,
    },
    status : {
        type : String,
        enum : ["processing","ready","failed"],
        default : "processing"
    }
}, {
    timestamps : true
});

const Content = mongoose.models.Content || mongoose.model('Content',ContentSchema);

export default Content