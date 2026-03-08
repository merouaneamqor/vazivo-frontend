const { execSync } = require("child_process");

const packages = ["@vercel/edge-config@^1.4.0", "@vercel/flags@^3.1.0"];

function detectPackageManager() {
  const fs = require("fs");
  if (fs.existsSync("pnpm-lock.yaml")) return "pnpm";
  if (fs.existsSync("yarn.lock")) return "yarn";
  if (fs.existsSync("bun.lockb")) return "bun";
  return "npm";
}

const pm = detectPackageManager();
const installCmd =
  pm === "yarn"
    ? `yarn add ${packages.join(" ")}`
    : `${pm} install ${packages.join(" ")}`;

console.log(`[v0] Using package manager: ${pm}`);
console.log(`[v0] Running: ${installCmd}`);

try {
  execSync(installCmd, { stdio: "inherit", cwd: process.cwd() });
  console.log("[v0] Packages installed successfully.");
} catch (err) {
  console.error("[v0] Installation failed:", err.message);
  process.exit(1);
}
