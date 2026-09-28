export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  const node = await import("./instrumentation.node");
  return node.register();
}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string },
) {
  const message = error instanceof Error ? error.message : String(error);
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest)
      : undefined;

  console.error(
    `[error] ${request.method} ${request.path}` +
      (digest ? ` digest=${digest}` : "") +
      `\n${message}\n${error instanceof Error ? (error.stack ?? "") : ""}`,
  );
}
