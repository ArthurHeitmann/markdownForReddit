import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import escapeHtml from "escape-html";
import {ParsingCursor} from "../parsingCursor.js";

export class P_Text extends P_Parser {
	static id = "text";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [];

	private readonly allowLineEndBreaks: boolean;

	constructor(cursor: ParsingCursor, allowLineEndBreaks = true) {
		super(cursor);

		this.allowLineEndBreaks = allowLineEndBreaks;
	}

	private parsedText = "";

	canStart(): boolean {
		return true;
	}

	parseChar(): AfterParseResult {
		this.parsedText += this.cursor.currentChar;
		return AfterParseResult.consumed;
	}

	toHtmlString(): string {
		if (this.allowLineEndBreaks)
			return  escapeHtml(this.parsedText)
				.replace(/ {2,}\n/g, "<br>\n")			// replace double space at end of line with <br>
				.replace(/(?<!<br>)\s*\n(?=.+)/g, " ")			// remove all other line breaks
		else
			return escapeHtml(this.parsedText);
	}

}
