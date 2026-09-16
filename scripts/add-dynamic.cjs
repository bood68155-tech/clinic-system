const fs = require("fs");
const path = require("path");

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]
  );
}

const files = walk("app/api").filter((f) => f.endsWith(".ts"));
for (const f of files) {
  const c = fs.readFileSync(f, "utf8");
  const marker = 'export const dynamic = "force-dynamic";';
  if (!c.includes("force-dynamic")) {
    const insertAt = c.indexOf("export ");
    const nc = c.slice(0, insertAt) + marker + "\n\n" + c.slice(insertAt);
    fs.writeFileSync(f, nc);
    console.log("DONE", f);
  } else {
    console.log("SKIP", f);
  }
}