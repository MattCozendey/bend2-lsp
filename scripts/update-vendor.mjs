// Refresh vendor/bend2 from the Bend commit pinned in package.json ("bend" field).
// Usage: npm run vendor:update [-- <commit-sha>]
// Passing a sha fetches that commit and rewrites the pin in package.json.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf8"));

const { repo } = pkg.bend;
const commit = process.argv[2] ?? pkg.bend.commit;
if (!/^[0-9a-f]{40}$/.test(commit)) {
  console.error(`Expected a full 40-char commit sha, got: ${commit}`);
  process.exit(1);
}

const files = ["bend2/bend.ts", "bend2/base.bend"];
const vendorDir = path.join(root, "vendor", "bend2");
await mkdir(vendorDir, { recursive: true });

for (const file of files) {
  const url = `https://raw.githubusercontent.com/${repo}/${commit}/${file}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const dest = path.join(vendorDir, path.basename(file));
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`Updated ${path.relative(root, dest)} from ${repo}@${commit.slice(0, 7)}`);
}

if (commit !== pkg.bend.commit) {
  pkg.bend.commit = commit;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`Pinned package.json bend.commit to ${commit}`);
}

console.log("Done. Run `npm test` and review the diff before committing.");
