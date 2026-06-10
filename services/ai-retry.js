const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_BASE_DELAY_MS = 1500;

function isTransientAiError(error) {
  const status = Number(error?.status);

  return (
    status === 408 ||
    status === 503 ||
    status === 504 ||
    error?.name === "AbortError" ||
    error?.code === "ETIMEDOUT" ||
    error?.code === "EMPTY_AI_RESPONSE"
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
  isTransientAiError,
  withAiRetry,
};
