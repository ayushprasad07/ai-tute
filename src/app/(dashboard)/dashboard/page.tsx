"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ApiResponse } from "@/types/ApiResponse"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const Dashboard = () => {
    const [credentials, setCredentials] = useState({
        title: '',
        type: 'pdf',
    })

    const router = useRouter();

    const handleChange = (name: string, value: string) => {
      setCredentials({...credentials, [name]: value})
    }

    const handleSubmit =async  (e: React.FormEvent) => {
      e.preventDefault()
      try {
        const response = await axios.post("/api/content",credentials);

        if(response.data.success){
          toast.success(response.data.message);
          router.push(`/content/${response.data.content._id}`);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(axiosError.response?.data.message ?? "Something went wrong");
      }
      console.log("Form submitted:", credentials)
      // Handle form submission here
    }
    
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={credentials.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter title"
                />
              </Field>
              <Field>
                <Label>Type</Label>
                <RadioGroup 
                  value={credentials.type}
                  onValueChange={(value) => handleChange("type", value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="cursor-pointer font-normal">
                      PDF
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="youtube" id="youtube" />
                    <Label htmlFor="youtube" className="cursor-pointer font-normal">
                      YouTube
                    </Label>
                  </div>
                </RadioGroup>
              </Field>
            </FieldGroup>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 my-4">
              <DialogClose asChild className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="w-full sm:w-auto">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Dashboard