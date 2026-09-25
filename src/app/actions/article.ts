"use server";

import { authenticateUser } from "@/lib/data/auth";
import { ensureUserExists } from "@/db/sync-user";
import * as articlesDbHelper from "@/lib/data/articles";
import { redis } from "@/db/cache";

export type CreateArticleInput = {
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
};

export async function createArticle(data: CreateArticleInput) {
  try {
    const auth = await authenticateUser();

    if (!auth.success) return auth;

    const { user } = auth;

    await ensureUserExists(user);

    const article = await articlesDbHelper.createArticle(data, user.id);

    return {
      success: true,
      message: `Article with id: ${article.id} has been created successfully!`,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong!" };
  }
}

export type UpdateArticleInput = Partial<
  Omit<CreateArticleInput, "authorId">
> & { id: number };

export async function updateArticle(data: UpdateArticleInput) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) return authResult;
    const { user } = authResult;

    const userCanUpdateArticle = await articlesDbHelper.authorizeUpdateArticle(
      user.id,
      data.id,
    );

    if (!userCanUpdateArticle) {
      return {
        success: false,
        message: "The user does not have permission to update the article!",
      };
    }

    await articlesDbHelper.updateArticle(data);

    return { success: true, message: "Article has been updated successfully!" };
  } catch (error) {
    console.error("Error during article update:", error);

    return { success: false, message: "Something went wrong!" };
  }
}

export async function deleteArticle(id: number) {
  try {
    const auth = await authenticateUser();

    if (!auth.success) return auth;

    const { user } = auth;

    const userCanDeleteArticle = await articlesDbHelper.authorizeUpdateArticle(
      user.id,
      id,
    );

    if (!userCanDeleteArticle) {
      return {
        success: false,
        message: "User does not have permission to delete the article!",
      };
    }

    await articlesDbHelper.deleteArticle(id);

    console.log("Article has been deleted successfully!");

    return { success: true, message: "Article has been deleted successfully!" };
  } catch (error) {
    console.error("deleteArticle::", error);

    return { success: false, message: "Something went wrong!" };
  }
}

export async function articleViewCount(id: number) {
  return await redis.incr(`pageviews:article:${id}`);
}
