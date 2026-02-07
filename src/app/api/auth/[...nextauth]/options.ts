import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";



export const authOptions : NextAuthOptions = {
    providers : [
        CredentialsProvider({
            id : "credentials",
            name : "Credentials",
            credentials: {
                identifier: { label: "Email", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials : any) : Promise<any> {
                await dbConnect();

                // if(!credentials.identifier || !credentials.password){
                //     throw new Error("All fields are required");
                // }
                try {
                    const user = await User.findOne({
                        $or:[
                            {email : credentials.identifier},                            
                            {username : credentials.identifier},                            
                        ]
                    })

                    if(!user){
                        throw new Error("User not found");
                    }

                    if(!user.isVerified){
                        throw new Error("Please verify your account first");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if(!isPasswordValid){
                        throw new Error("Invalid credentials");
                    }else{
                        return user;
                    }

                } catch (error) {
                    throw new Error("Database connection error");
                }
            }
        })
    ],
    callbacks : {
        async session({ session, token }) {
            if(token){
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.username = token.username;
            }
            return session
        },
        async jwt({ token, user }) {
            if(user){
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.username = user.username;
            }
            return token
        }
    },
    pages : {
        signIn: '/sign-in',
    },
    session : {
        strategy : "jwt"
    },
    secret : process.env.NEXTAUTH_SECRET
}