export async function searchTests({ query = "", limit = 20 } = {}) {
  const q = String(query).trim();

  // Phase 1b: replace with Shivam API integration.
  // Example target: /api/shivam/tests/search?q=<query>
  if (q.length === 0) return [];

  const response = await fetch(`/api/tests/search?q=${encodeURIComponent(q)}&limit=${limit}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to search tests");
  }

  const data = await response.json();
  return Array.isArray(data?.items) ? data.items : [];
}

export async function getTestPrice({ testCode }) {
  if (!testCode) return null;

  // Phase 1b: replace with Shivam API pricing endpoint.
  const response = await fetch(`/api/tests/price?code=${encodeURIComponent(testCode)}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to fetch test price");
  }

  const data = await response.json();
  return data?.item || null;
}
