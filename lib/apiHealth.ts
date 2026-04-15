export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("/api/health", {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("[API Health] Response:", response.status);
    return response.ok;
  } catch (error: any) {
    console.error("[API Health] Error:", error.message);
    return false;
  }
}

export async function testApiConnection(): Promise<{
  available: boolean;
  message: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      "/api/Auth/register",
      {
        method: "OPTIONS",
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    return {
      available: true,
      message: "API is reachable",
    };
  } catch (error: any) {
    console.error(
      "[API Test] Connection failed:",
      error.message || error.code
    );
    return {
      available: false,
      message: `API unreachable: ${error.message || "Unknown error"}`,
    };
  }
}
