"use client";

import { useActionState, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateArticle } from "@/app/actions/article";
import { UploadFile } from "@/components/wiki/article-edit/upload-file";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { uploadFile } from "@/app/actions/upload-image";
import { useRouter } from "next/navigation";

type WikiEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  articleId: string;
};

type FormErrors = {
  title?: string;
  content?: string;
};

export function WikiEditor({
  initialTitle = "",
  initialContent = "",
  articleId,
}: WikiEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [file, setFile] = useState<File>();
  const [errors, setErrors] = useState<FormErrors>({});
  const [, dispatchUpdate, isPending] = useActionState(handleUpdate, {
    success: false,
    message: "",
  });

  // Validate form
  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleUpdate() {
    if (!validateForm()) return;

    const toastId = toast.add({
      description: "Updating the Article...",
      type: "loading",
    });

    let fileUploadResult = undefined;
    if (file) {
      const result = await uploadFile(file);
      if (result.success) {
        fileUploadResult = result.fileUrl;
      } else {
        toast.update(toastId, { description: result.message, type: "error" });
        return result;
      }
    }

    const result = await updateArticle({
      id: Number(articleId),
      title,
      content,
      imageUrl: fileUploadResult,
    });

    toast.update(toastId, {
      description: result.success
        ? "Article has been updated successfully"
        : "Could not update the article",
      type: result.success ? "success" : "error",
      timeout: 3000,
    });

    if (result.success) router.push(`/wiki/${articleId}`);

    return result;
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      // const newFiles = Array.from(selectedFiles);
      setFile(selectedFiles[0]);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  return (
    <Dialog>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Article</h1>
          <p className="text-muted-foreground mt-2">
            Editing article ID: {articleId}
          </p>
        </div>

        <form action={dispatchUpdate} className="space-y-6">
          {/* Title Section */}
          <Card>
            <CardHeader>
              <CardTitle>Article Title</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter article title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Section */}
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="content">Content (Markdown) *</Label>
                <div
                  className={`border rounded-md ${
                    errors.content ? "border-destructive" : ""
                  }`}
                >
                  <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || "")}
                    preview="edit"
                    hideToolbar={false}
                    visibleDragbar={false}
                    textareaProps={{
                      placeholder: "Write your article content in Markdown...",
                      style: { fontSize: 14, lineHeight: 1.5 },
                    }}
                  />
                </div>
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <UploadFile
            file={file}
            onRemove={removeFile}
            onUpload={handleFileUpload}
          />

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end space-x-4">
                <DialogTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                  }
                />

                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[100px]"
                >
                  {isPending ? "Saving..." : "Save Article"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete all your
            recent changes on the article.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Link href={`/wiki/${articleId}`}>
            <Button>Yes, Leave</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
