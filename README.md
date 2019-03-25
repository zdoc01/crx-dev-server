# crx-dev-server

A dev "server" for Chrome extensions with hot reload capabilities.

# Installation

```sh
$ npm i --save-dev crx-dev-server
```

# Usage

By default, this package will look for a `manifest.json` definition in `process.cwd()`.

```sh
$ crx-dev-server
```

If you wish to use a `manifest.json` from a different location, simply specify the path via the `--manifest` command-line option:

```sh
$ crx-dev-server --manifest=/path/to/your/manifest.json
```

# How does it work?

This package injects a background script (see [crx-hotreload](https://github.com/xpl/crx-hotreload)) into your project's `manifest.json` that watches for file changes and auto-reloads your extension when they occur.

The background script (`hot-reload.js`) is copied into your project alongside your `manifest.json` (Chrome requires content and background scripts be local and relative to your `manifest.json`), then removed when the server is stopped.

# Motivation

I love the work that went into `crx-hotreload` as it makes my life easier as an extension developer, but I wanted a way to keep the background script definition out of my `manifest.json` so I could ship the extension without dev assets.

You can achieve something similar with a CI/CD pipeline, but that isn't necessarily applicable to every project.
