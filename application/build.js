const glob = require("tiny-glob");

(async () => {
    let entryPoints = await glob("src/**/index.ts");

    require("esbuild")
        .build({
            entryPoints,
            logLevel: "info",
            bundle: true,
            outdir: "dist",
            platform: "node",
            sourcemap: "inline",
            outbase: "src",
        })
        .catch(() => process.exit(1));
})();

