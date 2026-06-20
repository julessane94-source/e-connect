// tests/integration/api.test.ts
import { describe, it, expect } from "@jest/globals";

describe("API Routes", () => {
  it("should return health status", async () => {
    const response = await fetch("http://localhost:3000/api/health");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
  });
});
