#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ENCODING = { encoding: 'utf8' };
const MAX_TIMEOUT_DURATION = 2147483647;
const HOT_RELOAD_SCRIPT = 'hot-reload.js';
const args = process.argv[2];

// Use the manifest in the current directory by default,
// otherwise use the path defined in --manifest
let extManifest = './manifest.json';
if (!fs.existsSync(path.resolve(extManifest))) {
  if (args.startsWith('--manifest')) {
    /* eslint-disable-next-line prefer-destructuring */
    extManifest = args.split('=')[1];
  } else {
    console.log('No manifest found.');
    console.log(
      'Add one to the current directory, or specify a path via the --manifest option'
    );
    console.log('Usage: `crx-dev-server --manifest=path/to/manifest.json`');
    process.exit(1);
  }
}

const MANIFEST_PATH = path.resolve(extManifest);
const HOT_RELOAD_PATH = MANIFEST_PATH.replace(
  'manifest.json',
  HOT_RELOAD_SCRIPT
);

if (!fs.existsSync(MANIFEST_PATH)) {
  console.log(`No manifest found at the specified path ${extManifest}`);
  process.exit(1);
}

const original = JSON.parse(
  fs.readFileSync(MANIFEST_PATH, { encoding: 'utf8' })
);

const withHotReload = (mf = {}) => {
  const bg = { ...mf.background };
  const scripts = [...bg.scripts, HOT_RELOAD_SCRIPT];
  return {
    ...mf,
    background: {
      ...bg,
      scripts
    }
  };
};

const writeManifest = data => {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2), ENCODING);
};

const copyHotReload = () => {
  fs.copyFileSync(require.resolve('crx-hotreload'), HOT_RELOAD_PATH);
};

const removeHotReload = () => {
  fs.unlinkSync(HOT_RELOAD_PATH);
};

// add hot reload capabilities
const devManifest = withHotReload(original);
writeManifest(devManifest);
// Chrome requires files be local and relative to the
// `manifest.json`, so we're copying the script that
// handles hot reload functionality into the project
// as opposed to serving it over HTTP(s), etc.
copyHotReload();

// listen for script close
process.on('SIGINT', () => {
  // reset back to original manifest
  writeManifest(original);
  removeHotReload();
  process.exit(0);
});

// keep process alive to emulate "server"
setInterval(() => {}, MAX_TIMEOUT_DURATION);

console.log(`Starting crx-dev-server for the [ ${original.name} ] extension`);
console.log(`Using manifest at [ ${extManifest} ]`);
