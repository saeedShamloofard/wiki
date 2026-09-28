import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadFile } from "./upload-image";

const mocks = vi.hoisted(() => ({ authenticateUser: vi.fn(), put: vi.fn() }));
vi.mock("@/lib/data/auth", () => ({ authenticateUser: mocks.authenticateUser }));
vi.mock("@vercel/blob", () => ({ put: mocks.put }));

const maxSize = 10 * 1024 * 1024;
function image(size = 1, type = "image/png") {
  return new File([new Uint8Array(size)], "photo.png", { type });
}

beforeEach(() => {
  mocks.authenticateUser.mockResolvedValue({ success: true, user: { id: "user-1" } });
  mocks.put.mockResolvedValue({ url: "https://example.com/uploaded-image.png" });
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("uploadFile", () => {
  it("rejects unauthenticated uploads without contacting storage", async () => {
    const denial = { success: false, message: "Not authenticated" };
    mocks.authenticateUser.mockResolvedValue(denial);

    expect(await uploadFile(image())).toEqual(denial);
    expect(mocks.put).not.toHaveBeenCalled();
  });

  it.each([
    { label: "empty file", file: () => image(0), message: "No file provided" },
    { label: "missing file", file: () => undefined as unknown as File, message: "No file provided" },
    { label: "unsupported type", file: () => image(1, "text/plain"), message: "Invalid file type" },
    { label: "file over 10 MiB", file: () => image(maxSize + 1), message: "File too large" },
  ])("rejects $label before uploading", async ({ file, message }) => {
    expect(await uploadFile(file())).toEqual({ success: false, message });
    expect(mocks.put).not.toHaveBeenCalled();
  });

  it("accepts the size limit and returns the actual storage URL", async () => {
    const file = image(maxSize);

    expect(await uploadFile(file)).toMatchObject({
      success: true,
      fileUrl: "https://example.com/uploaded-image.png",
    });
    expect(mocks.put).toHaveBeenCalledWith(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });
  });

  it("returns a safe failure if storage rejects the upload", async () => {
    mocks.put.mockRejectedValue(new Error("Private storage details"));

    expect(await uploadFile(image())).toEqual({
      success: false,
      message: "Image upload failed. Please try again.",
    });
  });
});
