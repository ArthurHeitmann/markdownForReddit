# Markdown for reddit

[![Mocha Tests](https://github.com/ArthurHeitmann/markdownForReddit/actions/workflows/mochaTests.yml/badge.svg)](https://github.com/ArthurHeitmann/markdownForReddit/actions/workflows/mochaTests.yml)

A tool for converting reddit flavoured markdown text into HTML.

## Usage

```javascript
// import the .js file
import { parseMarkdown } from "./bundled/markdown-for-reddit.js";
// parse the markdown
const markdown = "# Hello __World__";
const html = parseMarkdown(markdown);	// <h1>Hello <strong>World</strong></h1>
// put it into an element
document.body.innerHTML = html;
```

## Building

### Bundling

Generates the `markdown-for-reddit.js` file and puts it into the `./bundled` folder.

```shell script
npm install
npm run bundle
```

### Development

This will automatically recompile the .ts files to .js files.

```shell script
npm run watch
```
