import {AfterParseResult} from "./parsers/P_Parser.js";
import {P_Root} from "./parsers/P_Root.js";
import {ParsingCursor} from "./parsingCursor.js";

/**
 * Converts markdown to html
 *
 * @param markdown The markdown string
 * @return Rendered HTML string
 */
export function parseMarkdown(markdown: string): string {
	// remove empty lines at start and end
	markdown = markdown.replace(/^(\s*\n)*|(\s*\n)*$|(?<=\n)\s*$/g, "");

	const cursor = new ParsingCursor(markdown);
	const rootParser = new P_Root(cursor);
	let parseResult: AfterParseResult;
	while (cursor.charIndex !== cursor.allText.length) {
		// parse next char
		parseResult = rootParser.parseChar();
		// move cursor & update cursor data
		cursor.incrementCursor();
	}

	return rootParser.toHtmlString();
}
