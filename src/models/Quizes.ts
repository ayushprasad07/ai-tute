import mongoose,{ Schema } from "mongoose";
import Content from "./Content";

export interface IQuizes{
    contentId : mongoose.Schema.Types.ObjectId;
    questions :{
        question : String;
        options : String[];
        correctAnswer : String;
        explanation : String;
    }[];
    createdAt : Date;
    updatedAt : Date;
}


const QuizSchema = new Schema<IQuizes>({
    contentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : Content,
        required : true
    },
    questions : [
        {
            question : {
                type : String,
                required : true
            },
            options : {
                type : [String],
                required : true
            },
            correctAnswer : {
                type : String,
                required : true
            },
            explanation : {
                type : String,
                required : true
            }
        }
    ]
}, {
    timestamps : true
})

const Quizes = mongoose.models.Quizes || mongoose.model('Quizes',QuizSchema);

export default Quizes;