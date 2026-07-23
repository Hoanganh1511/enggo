const { chromium } = require("playwright");
const { encode } = require("next-auth/jwt");
const path = require("path");

const SECRET = "aS9vjpUeVJjnU0oVYk1vyY1XbsxQnGtodnEvecUSMr4=";
const USER_ID = "23b68af7-2623-46f5-88d4-35484f92cf0f";
const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";
const COOKIE_NAME = "authjs.session-token";
const OUT_DIR =
  "C:\\Users\\PC\\AppData\\Local\\Temp\\claude\\c--Users-PC-Documents-personal-projects-enggo\\f96f35ba-1d89-4467-836a-99c5e4f07ae3\\scratchpad";

(async () => {
  const sessionToken = await encode({
    token: { userId: USER_ID, sub: USER_ID, email: "anhht.fe@gmail.com", name: "Anh Ht" },
    secret: SECRET,
    salt: COOKIE_NAME,
  });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await context.addCookies([
    { name: COOKIE_NAME, value: sessionToken, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ]);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(`http://localhost:3000/skill-tree/${WORKSPACE_ID}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, "kb-overview-v2.png"), fullPage: false });

  console.log("ERRORS:", JSON.stringify(errors));
  await browser.close();
})();
