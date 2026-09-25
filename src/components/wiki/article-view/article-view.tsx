"use client";

import {
  Calendar,
  ChevronRight,
  Edit,
  Home,
  Loader2,
  Trash,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// import { deleteArticleForm } from "@/app/actions/articles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Markdown } from "@/components/wiki/article-view/markdown";
import { formatDate } from "@/lib/utils";
import { useActionState } from "react";
import { deleteArticle } from "@/app/actions/article";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

type ViewerArticle = {
  title: string;
  author: string | null;
  id: number;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
};

type WikiArticleViewerProps = {
  article: ViewerArticle;
  canEdit?: boolean;
  pageviews?: number | null;
};

export function WikiArticleViewer({
  article,
  canEdit = false,
}: WikiArticleViewerProps) {
  const router = useRouter();

  const [, deleteAction, isPending] = useActionState(
    async () => {
      const deletePromise = deleteArticle(article.id);
      toast.promise(deletePromise, {
        loading: "Deleting the Article...",
        success: "Article has been deleted successfully",
        error: "Could not delete the article",
      });

      const newState = await deletePromise;
      if (newState.success) router.replace("/");

      return newState;
    },
    {
      success: false,
      message: "",
    },
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link
          href="/"
          className="flex items-center hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4 mr-1" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium overflow-hidden text-ellipsis whitespace-nowrap">
          {article.title}
        </span>
      </nav>

      {/* Article Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {article.title}
          </h1>

          {/* Article Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>By {article.author ?? "Unknown"}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Badge variant="secondary">Article</Badge>
            </div>
          </div>
        </div>

        {/* Edit Button - Only shown if user has edit permissions */}
        {canEdit && (
          <div className="ml-4 flex items-center gap-2">
            <Link href={`/wiki/edit/${article.id}`}>
              <Button variant="outline" className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Edit Article
              </Button>
            </Link>

            {/* Delete form calls the server action wrapper */}
            <form action={deleteAction}>
              <Button
                type="submit"
                variant="destructive"
                className="ml-2 cursor-pointer"
                disabled={isPending}
                aria-busy={isPending}
              >
                <Trash className="h-4 w-4 mr-2" />

                {isPending ? "Deleting..." : "Delete"}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Article Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Article Image - Display article image or default image */}
          <div className="mb-8">
            <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
              <Image
                src={article.imageUrl || "/placeholder-image.svg"}
                alt={`Image for ${article.title}`}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          {/* Rendered Markdown Content */}
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <Markdown content={article.content} />
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="mt-8 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline" className="cursor-pointer">
            ← Back to Articles
          </Button>
        </Link>
      </div>
    </div>
  );
}
