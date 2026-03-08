import { execSync } from "child_process";

console.log("[v0] Installing @vercel/edge-config and @vercel/flags...");

try {
  execSync("pnpm add @vercel/edge-config @vercel/flags", {
    cwd: "/vercel/share/v0-project",
    stdio: "inherit",
  });
  console.log("[v0] Packages installed successfully.");
} catch {
  // pnpm might not be available — fall back to npm
  console.log("[v0] pnpm failed, trying npm...");
  execSync("npm install @vercel/edge-config @vercel/flags", {
    cwd: "/vercel/share/v0-project",
    stdio: "inherit",
  });
  console.log("[v0] Packages installed via npm.");
}
