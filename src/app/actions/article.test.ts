import { beforeEach, describe, expect, it, vi } from "vitest";
import { createArticle, deleteArticle, updateArticle } from "./article";

const mocks = vi.hoisted(() => ({
  authenticateUser: vi.fn(),
  ensureUserExists: vi.fn(),
  authorizeUpdateArticle: vi.fn(),
  createArticle: vi.fn(),
  updateArticle: vi.fn(),
  deleteArticle: vi.fn(),
}));

vi.mock("@/lib/data/auth", () => ({ authenticateUser: mocks.authenticateUser }));
vi.mock("@/db/sync-user", () => ({ ensureUserExists: mocks.ensureUserExists }));
vi.mock("@/lib/data/articles", () => ({
  authorizeUpdateArticle: mocks.authorizeUpdateArticle,
  createArticle: mocks.createArticle,
  updateArticle: mocks.updateArticle,
  deleteArticle: mocks.deleteArticle,
}));
vi.mock("@/db/cache", () => ({ redis: { incr: vi.fn() } }));

const user = { id: "signed-in-user", displayName: "Test User", primaryEmail: null };
const input = { title: "Article", content: "Content", authorId: "spoofed-user" };

beforeEach(() => {
  mocks.authenticateUser.mockResolvedValue({ success: true, user });
  mocks.authorizeUpdateArticle.mockResolvedValue(true);
  mocks.createArticle.mockResolvedValue({ id: 42 });
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("createArticle", () => {
  it("rejects anonymous users without syncing or writing data", async () => {
    const denial = { success: false, message: "Not authenticated" };
    mocks.authenticateUser.mockResolvedValue(denial);

    expect(await createArticle(input)).toEqual(denial);
    expect(mocks.ensureUserExists).not.toHaveBeenCalled();
    expect(mocks.createArticle).not.toHaveBeenCalled();
  });

  it("uses the authenticated author and waits for user sync before creating", async () => {
    let finishSync!: () => void;
    mocks.ensureUserExists.mockImplementation(() => new Promise<void>((resolve) => {
      finishSync = resolve;
    }));

    const pending = createArticle(input);
    await vi.waitFor(() => expect(mocks.ensureUserExists).toHaveBeenCalledWith(user));
    expect(mocks.createArticle).not.toHaveBeenCalled();
    finishSync();

    expect(await pending).toMatchObject({ success: true });
    expect(mocks.createArticle).toHaveBeenCalledWith(input, user.id);
  });

  it("does not create an article if user synchronization fails", async () => {
    mocks.ensureUserExists.mockRejectedValue(new Error("Database unavailable"));

    expect(await createArticle(input)).toMatchObject({ success: false });
    expect(mocks.createArticle).not.toHaveBeenCalled();
  });

  it("returns a safe error when creation fails", async () => {
    mocks.createArticle.mockRejectedValue(new Error("Internal database details"));

    expect(await createArticle(input)).toEqual({
      success: false,
      message: "Something went wrong!",
    });
  });
});

describe.each([
  { name: "updateArticle", run: () => updateArticle({ id: 42, title: "Edited" }), write: mocks.updateArticle },
  { name: "deleteArticle", run: () => deleteArticle(42), write: mocks.deleteArticle },
])("$name", ({ run, write }) => {
  it("rejects unauthenticated callers before authorization or mutation", async () => {
    const denial = { success: false, message: "Not authenticated" };
    mocks.authenticateUser.mockResolvedValue(denial);

    expect(await run()).toEqual(denial);
    expect(mocks.authorizeUpdateArticle).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it("does not mutate another user's article", async () => {
    mocks.authorizeUpdateArticle.mockResolvedValue(false);

    expect(await run()).toMatchObject({ success: false });
    expect(mocks.authorizeUpdateArticle).toHaveBeenCalledWith(user.id, 42);
    expect(write).not.toHaveBeenCalled();
  });

  it("allows the owner to mutate the article", async () => {
    expect(await run()).toMatchObject({ success: true });
    expect(mocks.authorizeUpdateArticle).toHaveBeenCalledWith(user.id, 42);
    expect(write).toHaveBeenCalledOnce();
  });

  it("does not mutate when the authorization lookup fails", async () => {
    mocks.authorizeUpdateArticle.mockRejectedValue(new Error("Article missing"));

    expect(await run()).toMatchObject({ success: false });
    expect(write).not.toHaveBeenCalled();
  });

  it("returns a safe error when the mutation fails", async () => {
    write.mockRejectedValue(new Error("Internal database details"));

    expect(await run()).toEqual({ success: false, message: "Something went wrong!" });
  });
});
