import { Page, Request } from '@playwright/test';

export async function mockApi(page: Page) {
  // helper to satisfy all “http://localhost:8080/**” calls
  await page.route('**/api/**', (route, req) => route.fulfill(jsonOK(req)));
}

/* ---------- utils ---------- */
function jsonOK(req: Request) {
  // you could tailor per-endpoint here; for now return empty/200
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({}),
  };
}
