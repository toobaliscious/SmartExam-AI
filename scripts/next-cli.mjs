#!/usr/bin/env node

const nodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);

if (nodeMajor >= 25) {
  const nodeOptions = process.env.NODE_OPTIONS ?? "";
  if (!nodeOptions.includes("--no-experimental-webstorage")) {
    process.env.NODE_OPTIONS = `${nodeOptions} --no-experimental-webstorage`.trim();
  }
}

if (
  typeof globalThis.localStorage !== "undefined" &&
  typeof globalThis.localStorage?.getItem !== "function"
) {
  delete globalThis.localStorage;
}

await import("../node_modules/next/dist/bin/next");
