const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",
  setup(build) {
    build.onStart(() => {
      console.log("[watch] build started");
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log("[watch] build finished");
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "node",
    outfile: "dist/extension.js",
    external: ["vscode"],
    define: {
      HTML_DIR: JSON.stringify(path.join(__dirname, "dist", "html")),
    },
    logLevel: "silent",
    plugins: [
      esbuildProblemMatcherPlugin,
      {
        name: "copy-assets",
        setup(build) {
          build.onEnd(() => {
            const srcDir = path.join(__dirname, "src", "html");
            const destDir = path.join(__dirname, "dist", "html");
            fs.mkdirSync(destDir, { recursive: true });
            for (const file of fs.readdirSync(srcDir)) {
              fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
            }
            console.log("[copy-assets] copied src/html/ to dist/html/");

            const wasmSrc = path.join(__dirname, "node_modules", "sql.js", "dist", "sql-wasm.wasm");
            const wasmDest = path.join(__dirname, "dist", "sql-wasm.wasm");
            fs.copyFileSync(wasmSrc, wasmDest);
            console.log("[copy-assets] copied sql-wasm.wasm to dist/");
          });
        },
      },
    ],
  });

  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
