interface RetryConfig {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoff = true } = config;
  let lastError = new Error("Operation failed");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`[Retry] Attempt ${attempt}/${maxAttempts} failed:`, error);
      lastError = error as Error;

      if (attempt === maxAttempts) break;

      // Wait before next attempt, with exponential backoff if enabled
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
