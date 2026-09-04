export const JSON_BODY_LIMITS = {
  AUTH: 4_096,
  METADATA: 65_536,
  CHAPTERS: 524_288,
} as const;

export class JsonBodyError extends Error {
  constructor(
    public readonly status: 400 | 413,
    message: "Invalid JSON body" | "Request body too large"
  ) {
    super(message);
    this.name = "JsonBodyError";
  }
}

export async function readJsonBody<T>(request: Request, maxBytes: number): Promise<T> {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const declaredLength = Number(contentLength);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      throw new JsonBodyError(413, "Request body too large");
    }
  }

  const stream = request.body;
  if (!stream) {
    throw new JsonBodyError(400, "Invalid JSON body");
  }

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = stream.getReader();
  } catch {
    throw new JsonBodyError(400, "Invalid JSON body");
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // The response is already rejected; cancellation is best effort.
        }
        throw new JsonBodyError(413, "Request body too large");
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as T;
  } catch (error) {
    if (error instanceof JsonBodyError) throw error;
    throw new JsonBodyError(400, "Invalid JSON body");
  }
}
