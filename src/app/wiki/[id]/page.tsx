import { WikiArticleViewer } from "@/components/wiki/article-view/article-view";
import { authorizeUpdateArticle, getArticleById } from "@/lib/data/articles";
import { authenticateUser } from "@/lib/data/auth";
import { notFound } from "next/navigation";

type ViewArticlePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ViewArticlePage({
  params,
}: ViewArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(+id);

  if (!article) return notFound();

  const { user } = await authenticateUser();
  const canEdit = user ? await authorizeUpdateArticle(user.id, +id) : false;

  return <WikiArticleViewer article={article} canEdit={canEdit} />;
}
