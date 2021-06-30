import {AfterParseResult, ParsingState} from "./P_Parser.js";
import {P_Root} from "./P_Root.js";

export function parseMarkdown(markdown: string): string {
	if (!markdown)
		return "";

	const allLines = markdown.split("\n").map(line => `${line}\n`);
	const parsingState: ParsingState = {
		allText: markdown,
		row: 0,
		column: 0,
		charIndex: 0,
		allLines: allLines,
		currentLine: allLines[0],
		nextLine: allLines[1] ?? null,
		lineStart: 0,
		currentChar: markdown[0],
	}
	const rootParser = new P_Root(parsingState);
	let parseResult: AfterParseResult = AfterParseResult.consumed;
	while (parseResult !== AfterParseResult.ended) {
		// parse next char
		parseResult = rootParser.parse();

		// update parsing state
		parsingState.charIndex++;
		parsingState.currentChar = parsingState.allText[parsingState.charIndex]
		// reached end of all text
		if (parsingState.charIndex === parsingState.allText.length) {
			rootParser.onParentEnd();
			break;
		}
		// reached end of current line
		if (parsingState.column + 1 === parsingState.currentLine.length) {
			parsingState.row++;
			parsingState.column = 0;
			parsingState.currentLine = parsingState.allLines[parsingState.row];
			parsingState.nextLine = parsingState.allLines[parsingState.row + 1] ?? null;
			parsingState.lineStart = 0;
		}
		// still on same line
		else {
			parsingState.column++;
		}
	}

	return rootParser.toHtmlString();
}

console.log(`START:${parseMarkdown(
`

 

`
)}:END`)
