import { WikiCard } from "@/components/wiki/card/wiki-card";
import { getArticles } from "@/lib/data/articles";

const ARTICLES_LIST_LIMIT = 6;

export default async function Home() {
  const articles = await getArticles();

  return (
    <div>
      <main className="max-w-2xl mx-auto mt-10 flex flex-col gap-6 pb-6">
        {articles.map(({ author, content, createdAt, id, title }) => (
          <WikiCard
            key={id}
            summary={content.substring(0, 200)}
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
