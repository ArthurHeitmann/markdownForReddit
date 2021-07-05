import {AfterParseResult} from "./parsers/P_Parser.js";
import {P_Root} from "./parsers/P_Root.js";
import {ParsingCursor} from "./parsingCursor.js";

export function parseMarkdown(markdown: string): string {
	markdown = markdown.replace(/^(\s*\n)*|\s*$/g, "");

	const cursor = new ParsingCursor(markdown);
	const rootParser = new P_Root(cursor);
	let parseResult: AfterParseResult = AfterParseResult.consumed;
	while (cursor.charIndex !== cursor.allText.length) {
		// parse next char
		parseResult = rootParser.parseChar();
		// reached end of all text
		if (cursor.charIndex === cursor.allText.length)
			break;
		// move cursor & update cursor data
		cursor.moveCursor();
	}

	return rootParser.toHtmlString();
}

console.log(`:${parseMarkdown(`
- yeß
  - Ü
    
    ---
    - y
- x

`)}:`);
