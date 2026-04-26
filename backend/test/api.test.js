const test = require("node:test");
const assert = require("node:assert");
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-secret";
const app = require("../index.js");

const startServer = () => new Promise((resolve) => {
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
