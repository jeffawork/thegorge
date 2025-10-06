"use client"
import { toast } from "@/hooks/use-toast"

export const notify = {
  success: (message: string, title = "✅ Success") =>
    toast({
      title,
      description: message,
    }),

  error: (message: string, title = "❌ Error") =>
    toast({
      title,
      description: message,
      variant: "destructive",
    }),

  info: (message: string, title = "ℹ️ Info") =>
    toast({
      title,
      description: message,
    }),
}
