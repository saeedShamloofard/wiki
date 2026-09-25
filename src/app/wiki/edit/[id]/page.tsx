import { WikiEditor } from "@/components/wiki/article-edit/article-edit";
import { getArticleById } from "@/lib/data/articles";
import { authenticateUser } from "@/lib/data/auth";
import { redirect } from "next/navigation";

type EditArticlePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { user } = await authenticateUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { id } = await params;
  const article = await getArticleById(+id);

  return (
    <WikiEditor
      initialTitle={article.title}
      initialContent={article.content}
      isEditing={true}
      articleId={id}
    />
  );
}
