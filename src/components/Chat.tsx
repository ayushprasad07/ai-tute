import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

type ChatProps = {
    contentId : string
}

const Chat = ({contentId} : ChatProps) => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [chats,setChats] = useState([]);
    const [isChat, setIsChat] = useState(false);

    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(e.target.value);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/chat",{
                contentId : contentId,
                question
            });

            if(response.data.success){
                setAnswer(response.data.answer);
                toast.success(response.data.message);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message ?? "Something went wrong");
        }
        console.log("Form submitted" , question);
    }

    const fetchChats = async()=>{
        try {
            const response = await axios.get(`/api/chat/fetch-chats/${contentId}`);

            if(response.data.success){
                setIsChat(true);
                setChats(response.data.data);
                toast.success(response.data.message);
            }
        } catch (error) {
            const axiosError = new AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Unable to fetch chats")
        }
    }

    useEffect(()=>{
        fetchChats();
        console.log(chats);
    },[contentId])
  return (
    <div>
      {isChat && (
                <div>
                {chats.map((msg:any) => (
        <p key={msg._id}>
            {msg.role}: {msg.text}
        </p>
        ))}

        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input type="text" name="question"  placeholder="Ask a question about this content..." onChange={handleChange}/>
        <button type="submit" >Send</button>
      </form>
      <p>{answer}</p>
    </div>
  )
}

export default Chat;