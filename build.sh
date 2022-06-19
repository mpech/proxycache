rm -rf dist

# https://github.com/evanw/esbuild/issues/1958
#externals='--external:./node_modules/* --external:bun:ffi'
externals=$(node -e 'console.log(Object.keys(require("./package.json").dependencies).map(x => `--external:${x}`).join(" "))')
externals="$externals --external:bun:ffi"

npx esbuild\
  --platform=node\
  $externals\
  --bundle\
  --outdir=dist\
  --out-extension:.js=.cjs\
  index.js lib/*.js bin/cli.js

