import {AfterParseResult} from "./parsers/P_Parser.js";
import {P_Root} from "./parsers/P_Root.js";
import {ParsingCursor} from "./parsingCursor.js";

export function parseMarkdown(markdown: string): string {
	if (!markdown)
		return "";

	const cursor = new ParsingCursor(markdown);
	const rootParser = new P_Root(cursor);
	let parseResult: AfterParseResult = AfterParseResult.consumed;
	while (parseResult !== AfterParseResult.ended) {
		// parse next char
		parseResult = rootParser.parseChar();
		// reached end of all text
		if (cursor.charIndex === cursor.allText.length)
			break;
		// move cursor & update cursor data
		cursor.moveCursor();
	}
	rootParser.onParentEnd();

	return rootParser.toHtmlString();
}

console.log(`:${parseMarkdown(`x_t_x`)}:`);
