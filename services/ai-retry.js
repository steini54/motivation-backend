const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_BASE_DELAY_MS = 1500;
const TRANSIENT_NETWORK_CODES = new Set([
  "EAI_AGAIN",
  "ECONNRESET",
  "ENETUNREACH",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

function getAiErrorCode(error) {
  return error?.code || error?.cause?.code || null;
}

function isTransientAiError(error) {
  const status = Number(error?.status);
  const code = getAiErrorCode(error);

  return (
    status === 408 ||
    status === 503 ||
    status === 504 ||
    error?.name === "AbortError" ||
    TRANSIENT_NETWORK_CODES.has(code) ||
    code === "EMPTY_AI_RESPONSE"
  );
}

async function withAiRetry(
  operation,
  {
    attempts = DEFAULT_RETRY_ATTEMPTS,
    baseDelayMs = DEFAULT_RETRY_BASE_DELAY_MS,
    sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay)),
  } = {}
) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      if (!isTransientAiError(error) || attempt === attempts) {
        throw error;
      }

      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}

module.exports = {
  DEFAULT_RETRY_ATTEMPTS,
  DEFAULT_RETRY_BASE_DELAY_MS,
  getAiErrorCode,
  isTransientAiError,
  withAiRetry,
};
