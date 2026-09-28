import { WikiCard } from "@/components/wiki/card/wiki-card";
import { getArticles } from "@/lib/data/articles";

export default async function Home() {
  const articles = await getArticles();

  return (
    <div>
      <main className="max-w-2xl mx-auto mt-10 flex flex-col gap-6 pb-6">
        {articles.map(({ author, createdAt, id, title, summary }) => (
          <WikiCard
            key={id}
            summary={summary ?? "Summary is not available at the moment"}
            href={`/wiki/${id}`}
            author={author}
            date={createdAt}
            title={title}
          />
        ))}
      </main>
    </div>
  );
}
