const test = require("node:test");
const assert = require("node:assert");
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-secret";
const app = require("../index.js");

const startServer = () =>
  new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });

test("health route responds OK", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/health`);
  const body = await response.json();
  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.status, "ok");
  server.close();
});

test("digilocker login route redirects", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/digilocker/login`, { redirect: "manual" });
  assert.strictEqual(response.status, 302);
  assert.ok(response.headers.get("location"));
  server.close();
});

test("chat route validates request body", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "" }),
  });
  assert.strictEqual(response.status, 400);
  server.close();
});

// ============== COMPREHENSIVE TEST SUITE ==============

test("chat route rejects message exceeding max length", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const longMessage = "a".repeat(1001);
  const response = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: longMessage }),
  });
  assert.strictEqual(response.status, 400);
  const body = await response.json();
  assert.ok(body.error.includes("Message too long"));
  server.close();
});

test("chat route rejects invalid language", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello", language: "invalid" }),
  });
  assert.strictEqual(response.status, 400);
  server.close();
});

test("chat route accepts valid languages", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;

  for (const lang of ["en", "hi", "mr"]) {
    const response = await fetch(`${url}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Test", language: lang }),
    });
    assert.strictEqual(response.status, 200);
  }
  server.close();
});

test("booth search requires latitude and longitude", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;

  // Missing lat
  let response = await fetch(`${url}/api/booths?lng=77.1025`);
  assert.strictEqual(response.status, 400);

  // Missing lng
  response = await fetch(`${url}/api/booths?lat=28.7041`);
  assert.strictEqual(response.status, 400);

  server.close();
});

test("booth search validates coordinate ranges", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;

  // Invalid latitude (> 90)
  let response = await fetch(`${url}/api/booths?lat=95&lng=77.1025`);
  assert.strictEqual(response.status, 400);
  let body = await response.json();
  assert.ok(body.error.includes("Invalid latitude"));

  // Invalid longitude (< -180)
  response = await fetch(`${url}/api/booths?lat=28.7041&lng=-200`);
  assert.strictEqual(response.status, 400);
  body = await response.json();
  assert.ok(body.error.includes("Invalid longitude"));

  server.close();
});

test("booth search rejects invalid radius", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;

  let response = await fetch(`${url}/api/booths?lat=28.7041&lng=77.1025&radius=-5`);
  assert.strictEqual(response.status, 400);

  response = await fetch(`${url}/api/booths?lat=28.7041&lng=77.1025&radius=0`);
  assert.strictEqual(response.status, 400);

  server.close();
});

test("booth search succeeds with valid coordinates", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/booths?lat=28.7041&lng=77.1025&radius=10`);
  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.ok(Array.isArray(body.booths));
  assert.ok(body.count >= 0);
  assert.ok(body.center);
  server.close();
});

test("booth directions validates coordinates", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;

  // Missing coordinates
  let response = await fetch(`${url}/api/booth-directions?originLat=28.7041`);
  assert.strictEqual(response.status, 400);

  // Same origin and destination
  response = await fetch(`${url}/api/booth-directions?originLat=28.7041&originLng=77.1025&destLat=28.7041&destLng=77.1025`);
  assert.strictEqual(response.status, 400);
  let body = await response.json();
  assert.ok(body.error.includes("cannot be the same"));

  server.close();
});

test("booth directions succeeds with valid different coordinates", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/booth-directions?originLat=28.7041&originLng=77.1025&destLat=28.5244&destLng=77.1855`);
  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.ok(body.distance);
  assert.ok(body.estimatedTime);
  assert.ok(body.alternatives);
  server.close();
});

test("get booth by ID requires valid ID", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/booths/INVALID_ID`);
  assert.strictEqual(response.status, 404);
  server.close();
});

test("get booth by ID succeeds with valid ID", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/booths/B001`);
  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.ok(body.boothId);
  assert.ok(body.name);
  server.close();
});

test("live status succeeds without parameters", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/live-status`);
  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.ok(body.totalBooths);
  assert.ok(body.totalVotersProcessed >= 0);
  assert.ok(body.globalTurnout >= 0);
  server.close();
});

test("live status with valid booth ID", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/live-status?boothId=B001`);
  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.ok(body.boothId === "B001");
  server.close();
});

test("live status with valid region ID", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/live-status?regionId=R001`);
  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.ok(body.regionId === "R001");
  server.close();
});

test("best vote time requires booth ID", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/best-vote-time`);
  assert.strictEqual(response.status, 400);
  server.close();
});

test("best vote time succeeds with valid booth ID", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/best-vote-time?boothId=B001`);
  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.ok(body.suggestedTime);
  assert.ok(body.estimatedWaitTime >= 0);
  server.close();
});

test("eligibility check requires age", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ citizenship: "indian" }),
  });
  assert.strictEqual(response.status, 400);
  server.close();
});

test("eligibility check rejects invalid age", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;

  // Age too high
  let response = await fetch(`${url}/api/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ age: 150, citizenship: "indian" }),
  });
  assert.strictEqual(response.status, 400);

  // Negative age
  response = await fetch(`${url}/api/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ age: -5, citizenship: "indian" }),
  });
  assert.strictEqual(response.status, 400);

  server.close();
});

test("eligibility check marks eligible users correctly", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ age: 25, citizenship: "indian" }),
  });
  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.strictEqual(body.eligible, true);
  assert.ok(Array.isArray(body.reasons));
  server.close();
});

test("eligibility check marks ineligible users correctly", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ age: 16, citizenship: "indian" }),
  });
  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.strictEqual(body.eligible, false);
  server.close();
});

test("admin stats requires authorization header", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/admin/stats`);
  assert.strictEqual(response.status, 401);
  server.close();
});

test("admin stats succeeds with authorization", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/admin/stats`, {
    headers: { "x-admin-key": "test-key" },
  });
  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.ok(body.overview);
  assert.ok(body.regions);
  assert.ok(body.booths);
  server.close();
});

test("404 route returns proper error", async () => {
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/api/nonexistent`);
  assert.strictEqual(response.status, 404);
  const body = await response.json();
  assert.ok(body.error);
  server.close();
});
