import { CreateArticleInput, UpdateArticleInput } from "@/app/actions/article";
import { db } from "@/db";
import { articles, usersSync } from "@/db/schema";
import { eq } from "drizzle-orm";

const articleMapSchema = {
  id: articles.id,
  title: articles.title,
  content: articles.content,
  author: usersSync.name,
  authorId: articles.authorId,
  createdAt: articles.createdAt,
};

export async function getArticles(limit?: number) {
  const query = db
    .select(articleMapSchema)
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));

  const data = limit === undefined ? await query : await query.limit(limit);

  return data;
}

export async function getArticleById(id: number) {
  const article = await db
    .select({ ...articleMapSchema, imageUrl: articles.imageUrl })
    .from(articles)
    .where(eq(articles.id, id))
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));

  return article[0] || null;
}

export async function createArticle(
  input: CreateArticleInput,
  authorId: string,
) {
  const response = await db
    .insert(articles)
    .values({
      title: input.title,
      content: input.content,
      slug: `${Date.now()}`,
      published: true,
      authorId,
    })
    .returning({ id: articles.id });

  return response[0];
}

export async function updateArticle(input: UpdateArticleInput) {
  return await db.update(articles).set(input).where(eq(articles.id, input.id));
}

export async function deleteArticle(id: number) {
  return await db.delete(articles).where(eq(articles.id, id));
}

export async function authorizeUpdateArticle(
  userId: string,
  articleId: number,
) {
  const article = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId));

  if (!article.length)
    throw new Error("Provided article id does not exist in DB!");

  return article[0].authorId === userId;
}
