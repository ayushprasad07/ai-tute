"use client";

import Chat from "@/components/Chat";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { ApiResponse } from "@/types/ApiResponse";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const Content = () => {
  const params = useParams();
  const contentId = params.contentId as string;

  const [files, setFiles] = useState<File[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const queryClient = useQueryClient();

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
  };

  const handleUpload = async () => {
    if (!files.length) return toast.error("Upload a file first");

    setDisabled(true);
    try {
      const formData = new FormData();
      formData.append("pdf", files[0]);
      formData.append("contentId", contentId);

      const response = await axios.post("/api/content/pdf-upload", formData);
      toast.success(response.data.message);

      queryClient.invalidateQueries({
        queryKey: ["content", contentId],
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Something went wrong"
      );
    } finally {
      setDisabled(false);
    }
  };

  const handleGenerate = async () => {
    try {
      await axios.post("/api/content/process-pdf", { contentId });

      const summaryRes = await axios.post(
        "/api/content/generate-summary",
        { contentId }
      );

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.content);

        queryClient.invalidateQueries({
          queryKey: ["content", contentId],
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Something went wrong"
      );
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSourceUrl(e.target.value);
  }

  const handleURLSubmit = async (e : React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    try {
      const response = await axios.post("/api/content/process-youtube",{
        contentId : params.contentId,
        sourceUrl : sourceUrl
      })

      const summaryRes = await axios.post(
        "/api/content/generate-summary",
        { contentId }
      );

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.content);

        queryClient.invalidateQueries({
          queryKey: ["content", contentId],
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Something went wrong"
      );
    }
  }

  const { data: content, isLoading } = useQuery({
    queryKey: ["content", contentId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/content/fetch-content-by-id/${contentId}`
      );

      if (response.data.success) {
        return response.data.content;
      }

      return null;
    },
    enabled: !!contentId,
  });

  const isYoutube = content?.type === "youtube";

  const hasSummary = !!(content?.summary || summary);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }


  return hasSummary ? (
    <div className="grid p-4 gap-4 grid-cols-1 md:grid-cols-2">
      <div className="w-full max-w-4xl mx-auto m-4 p-6 border rounded-lg">
        <div className="h-[20rem] relative flex items-center justify-center">
          <BackgroundRippleEffect />
          <Card className="shadow-lg border p-4 z-10">
            <p>{content?.url}</p>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <p>{content?.summary || summary}</p>
        </div>
      </div>

      <div className="p-2">
        <Chat contentId={contentId} />
      </div>
    </div>
  ) : isYoutube ? (
    <div className="p-4">
      this is youtube
      <div>
        <form onSubmit={handleURLSubmit}>
          <Input placeholder="Enter URL" name="sourceUrl" onChange={handleUrlChange}/>
          <Button type="submit">Submit</Button>
        </form>
        <p>{summary}</p>
      </div>
    </div>
  ) : (
    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
      <div>
        <FileUpload onChange={handleFileUpload} />

        <Button
          className="px-4 py-2 rounded-md mt-4"
          disabled={disabled}
          onClick={handleUpload}
        >
          Upload
        </Button>
      </div>

      <div className="p-4 h-full">
        <Button onClick={handleGenerate}>Generate Summary</Button>
        <div>{summary}</div>
      </div>
    </div>
  );
};

export default Content;
