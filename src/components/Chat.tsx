"use client"

import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type ChatProps = {
  contentId: string
}

const Chat = ({ contentId }: ChatProps) => {

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  }

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats", contentId],
    queryFn: async () => {
      const res = await axios.get(`/api/chat/fetch-chats/${contentId}`);

      if (res.data.success) {
        return res.data.data;
      }

      return [];
    },
    enabled: !!contentId
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/chat", {
        contentId,
        question
      });

      if (response.data.success) {
        setAnswer(response.data.answer);
        toast.success(response.data.message);
        queryClient.invalidateQueries({ queryKey: ["chats", contentId] });

        setQuestion("");
      }

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Something went wrong");
    }
  }

  return (
    <div>

      {isLoading && <p>Loading chats...</p>}

      <div>
        {chats.map((msg: any) => (
          <p key={msg._id}>
            {msg.role}: {msg.text}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="question"
          value={question}
          placeholder="Ask a question..."
          onChange={handleChange}
        />
        <button type="submit">Send</button>
      </form>

      <p>{answer}</p>
    </div>
  )
}

export default Chat;
