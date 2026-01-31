import mongoose, {Schema} from "mongoose";

export interface IUSER{
    username : string,
    email : string,
    password : string,
    verificationCode : String;
    verificationCodeExpiry : Date;
    isVerified : boolean;
    createdAt : Date,
}

const UserScehma = new Schema<IUSER>({
    username : {
        type : String,
        required : true,
        unique : true,
        match : /^[A-Za-z0-9 ]+$/
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password : {
        type : String,
        required : true,
        max : 10
    },
    verificationCode : {
        type : String,
        required : true
    },
    verificationCodeExpiry : {
        type : Date,
        required : true
    },
    isVerified : {
        type : Boolean,
        default : false
    }
},{
    timestamps : true
});

const User = mongoose.models.User || mongoose.model('User',UserScehma);

export default User;


