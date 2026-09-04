import { describe, expect, it } from "vitest";
import { JSON_BODY_LIMITS, readJsonBody } from "./request-json";

function chunkedRequest(chunks: string[]): Request {
  const encoder = new TextEncoder();
  let nextChunk = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      const chunk = chunks[nextChunk++];
      if (chunk === undefined) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunk));
    },
  });

  return new Request("https://test", {
    method: "POST",
    body: stream,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
}

describe("readJsonBody", () => {
  it("parses a valid JSON body within the limit", async () => {
    const body = await readJsonBody<{ title: string }>(
      new Request("https://test", { method: "POST", body: '{"title":"Paris"}' }),
      JSON_BODY_LIMITS.METADATA
    );

    expect(body).toEqual({ title: "Paris" });
  });

  it("rejects malformed JSON bytes as a client error", async () => {
    await expect(
      readJsonBody(new Request("https://test", { method: "POST", body: "{" }), 64)
    ).rejects.toMatchObject({ status: 400, message: "Invalid JSON body" });
  });

  it("rejects a Content-Length above the limit before reading", async () => {
    await expect(
      readJsonBody(
        new Request("https://test", {
          method: "POST",
          headers: { "Content-Length": "65" },
          body: "{}",
        }),
        64
      )
    ).rejects.toMatchObject({ status: 413, message: "Request body too large" });
  });

  it("rejects a chunked stream that crosses the limit", async () => {
    await expect(readJsonBody(chunkedRequest(["1234", "5678"]), 7)).rejects.toMatchObject({
      status: 413,
      message: "Request body too large",
    });
  });
});
