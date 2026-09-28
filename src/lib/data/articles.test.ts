import { beforeEach, describe, expect, it, vi } from "vitest";
import { getArticles, updateArticle } from "./articles";

const mocks = vi.hoisted(() => ({
  get: vi.fn(), setCache: vi.fn(), del: vi.fn(), summarize: vi.fn(),
  select: vi.fn(), from: vi.fn(), innerJoin: vi.fn(),
  update: vi.fn(), setArticle: vi.fn(), where: vi.fn(),
}));

vi.mock("@/db", () => ({ db: { select: mocks.select, update: mocks.update } }));
vi.mock("@/db/cache", () => ({
  redis: { get: mocks.get, set: mocks.setCache, del: mocks.del },
}));
vi.mock("@/AI/summarize", () => ({ default: mocks.summarize }));

const article = {
  id: 42, title: "Article", content: "Content", author: "Test User",
  authorId: "user-1", createdAt: "2026-01-01", summary: "Summary",
};

beforeEach(() => {
  mocks.get.mockResolvedValue(null);
  mocks.select.mockReturnValue({ from: mocks.from });
  mocks.from.mockReturnValue({ innerJoin: mocks.innerJoin });
  mocks.innerJoin.mockResolvedValue([article]);
  mocks.update.mockReturnValue({ set: mocks.setArticle });
  mocks.setArticle.mockReturnValue({ where: mocks.where });
  mocks.where.mockResolvedValue({ rowCount: 1 });
  mocks.summarize.mockResolvedValue("New summary");
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("getArticles", () => {
  it.each([
    { label: "articles", rows: [article] },
    { label: "an empty list", rows: [] },
  ])("serves $label from cache without querying the database", async ({ rows }) => {
    mocks.get.mockResolvedValue(rows);

    expect(await getArticles()).toEqual(rows);
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.setCache).not.toHaveBeenCalled();
  });

  it("fetches and caches database results on a cache miss", async () => {
    expect(await getArticles()).toEqual([article]);
    expect(mocks.select).toHaveBeenCalledOnce();
    const key = mocks.get.mock.calls[0][0];
    expect(mocks.setCache).toHaveBeenCalledWith(key, [article], { ex: 120 });
  });

  it("does not cache a failed database query", async () => {
    mocks.innerJoin.mockRejectedValue(new Error("Database unavailable"));

    await expect(getArticles()).rejects.toThrow("Database unavailable");
    expect(mocks.setCache).not.toHaveBeenCalled();
  });
});

describe("updateArticle", () => {
  it("regenerates the summary when content changes and invalidates the list cache", async () => {
    const input = { id: 42, title: "Edited title", content: "New content" };

    await updateArticle(input);

    expect(mocks.summarize).toHaveBeenCalledWith(input.title, input.content);
    expect(mocks.setArticle).toHaveBeenCalledWith({ ...input, summary: "New summary" });
    await getArticles();
    expect(mocks.del).toHaveBeenCalledWith(mocks.get.mock.calls[0][0]);
  });

  it("preserves the summary for image-only updates without calling AI", async () => {
    const input = { id: 42, imageUrl: "https://example.com/image.png" };

    await updateArticle(input);

    expect(mocks.summarize).not.toHaveBeenCalled();
    expect(mocks.setArticle).toHaveBeenCalledWith({ ...input, summary: undefined });
  });

  it("does not write or invalidate cache if summary generation fails", async () => {
    mocks.summarize.mockRejectedValue(new Error("AI unavailable"));

    await expect(updateArticle({ id: 42, content: "New content" })).rejects.toThrow("AI unavailable");
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.del).not.toHaveBeenCalled();
  });

  it("does not invalidate cache if the database update fails", async () => {
    mocks.where.mockRejectedValue(new Error("Database unavailable"));

    await expect(updateArticle({ id: 42, title: "Edited" })).rejects.toThrow("Database unavailable");
    expect(mocks.del).not.toHaveBeenCalled();
  });
});
