"use server";

import { authenticateUser } from "@/lib/data/auth";

export type UploadedFile = {
  url: string;
  size: number;
  type: string;
  filename?: string;
};

export type UploadFileResult =
  | { success: false; message: string }
  | { success: true; message: string; fileUrl: string };

export async function uploadFile(file: File): Promise<UploadFileResult> {
  const authResult = await authenticateUser();

  if (!authResult.success) return authResult;

  // Basic validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  console.log("📤 uploadFile called, received files:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!file) {
    return { success: false, message: "No file provided" };
  }

  if (!ALLOWED.includes(file.type)) {
    return { success: false, message: "Invalid file type" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, message: "File too large" };
  }

  // TODO: Insert Cloudinary upload code here.
  // Example: upload using Cloudinary SDK on the server and return secure_url

  // Return mock file info for now
  return {
    success: true,
    fileUrl: "/placeholder-image.svg",
    message: "File has been uploaded successfully",
  };
}
