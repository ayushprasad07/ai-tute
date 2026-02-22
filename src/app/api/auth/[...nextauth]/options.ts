import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { rateLimit } from "@/lib/rateLimit";



export const authOptions : NextAuthOptions = {
    providers : [
        CredentialsProvider({
            id : "credentials",
            name : "Credentials",
            credentials: {
                identifier: { label: "Email", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials : any, req : any) : Promise<any> {

                const ip =
                    req?.headers?.["x-forwarded-for"]?.split(",")[0] ||
                    req?.headers?.["x-real-ip"] ||
                    "anonymous";

                const limit = await rateLimit(
                    `aitute:login:ip:${ip}`,
                    {
                        limit: 5,   // max 5 login attempts
                        window: 60  // per minute
                    }
                );

                if (!limit.success) {
                    throw new Error("Too many login attempts. Try again later.");
                }

                try {
                    await dbConnect(); // only DB connection inside try

                    const user = await User.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier },
                        ],
                    });

                    if (!user) {
                        throw new Error("Invalid credentials");
                    }

                    if (!user.isVerified) {
                        throw new Error("Please verify your account first");
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        throw new Error("Invalid credentials");
                    }

                    return user;

                } catch (error: any) {
                    console.error("Auth error:", error);

                    if (error.message === "Invalid credentials" ||
                        error.message === "Please verify your account first") {
                        throw error;
                    }

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