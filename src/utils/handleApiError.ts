import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types";

export function handleApiError(
  error: unknown,
  fallbackMessage = "An error occurred",
) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiResponse;
    if (data?.errors) {
      const messages = Object.values(data.errors).flat().join("\n");
      toast.error(messages || fallbackMessage);
    } else {
      toast.error(data?.message || fallbackMessage);
    }
  } else {
    toast.error(fallbackMessage);
  }
}
