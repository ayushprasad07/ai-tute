"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NavbarDemo } from "@/components/Navbar";
import Image from "next/image";
import { Loader } from "lucide-react";
import  { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupFormDemo() {
    const [credentials,setCredentials] = useState({identifier:"",password:""})
    const [submitting , setSubmitting] = useState(false);
    const router = useRouter();
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        const response = await signIn("credentials",{
            identifier: credentials.identifier,
            password: credentials.password,
            redirect: false
        });

        if(response?.error){
            toast.error(response.error);
        }else{
            toast.success("Login successful");
            router.push("/dashboard");
        }
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(axiosError.response?.data.message ?? "Something went wrong");
    }finally{
        setSubmitting(false);
    }
  };

  const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
      setCredentials({...credentials,[e.target.name] : e.target.value})
  }
  return (
    <div className="flex justify-center p-4 items-center min-h-screen w-full dark:bg-gradient-to-br dark:from-gray-900 dark:to-black">
        <NavbarDemo/>
        <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
            <div className="text-center w-full">
                <div className="flex items-center justify-center">
                    <Image src="/AI-Tute.png" alt="AITute" width={120} height={120} className="h-full w-auto" />
                </div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                    Welcome to AITute
                </h2>
            </div>

            <form className="my-8" onSubmit={handleSubmit}>
                <LabelInputContainer className="mb-4">
                <Label htmlFor="identifier">Email/Username</Label>
                <Input id="identifier" placeholder="Email/Username" name="identifier" type="text" onChange={handleInputChange}/>
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="Password" type="password" name="password" onChange={handleInputChange}/>
                </LabelInputContainer>
                

                <button
                    className="group/btn relative flex items-center justify-center h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                    type="submit"
                    disabled={submitting}
                    >
                    {submitting ? (
                        <div className="flex items-center justify-center gap-2">
                        <Loader className="animate-spin h-4 w-4" />
                        <span>Signing in...</span>
                        </div>
                    ) : (
                        <span>Sign in &rarr;</span>
                    )}
                    <BottomGradient />
                </button>
            </form>
        </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
