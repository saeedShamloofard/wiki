import { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type UploadFileProps = {
  file?: File;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

export function UploadFile({ file, onRemove, onUpload }: UploadFileProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <div className="space-y-2">
              <Label
                htmlFor="file-upload"
                className="cursor-pointer text-sm font-medium"
              >
                Click to upload image
              </Label>
              <p className="text-xs text-muted-foreground">
                Upload image to attach to your article
              </p>
            </div>
            <Input
              id="file-upload"
              type="file"
              onChange={onUpload}
              className="sr-only"
            />
          </div>

          {/* Display uploaded files */}
          {file && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Uploaded Files:</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
