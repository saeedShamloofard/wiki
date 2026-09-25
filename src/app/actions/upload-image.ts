"use server";

import { authenticateUser } from "@/lib/data/auth";
import { put } from "@vercel/blob";

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
  const ALLOWED = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "No file provided" };
  }
  console.log(file.type);
  if (!ALLOWED.includes(file.type)) {
    return { success: false, message: "Invalid file type" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, message: "File too large" };
  }

  try {
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return {
      success: true,
      fileUrl: blob.url,
      message: "File has been uploaded successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Image upload failed. Please try again.",
    };
  }
}
