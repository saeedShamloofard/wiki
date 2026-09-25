import { WikiEditor } from "@/components/wiki/article-edit/article-edit";
import { hexclaveServerApp } from "@/hexclave/server";
import { authenticateUser } from "@/lib/data/auth";
import { redirect } from "next/navigation";

export default async function NewArticlePage() {
  const { user } = await authenticateUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <WikiEditor isEditing={false} />;
}
