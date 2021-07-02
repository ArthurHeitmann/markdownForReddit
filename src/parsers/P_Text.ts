import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {ParsingCursor} from "../parsingCursor.js";
import {escapeHtml} from "../utils.js";

export class P_Text extends P_Parser {
	id: string = "text";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [];

	private static escapableCharsRegex = /\\([`~*_\-\\><\]^])/g;
	private readonly modifyLineBreaks: boolean;

	constructor(cursor: ParsingCursor, modifyLineBreaks = true) {
		super(cursor);

		this.modifyLineBreaks = modifyLineBreaks;
	}

	private parsedText = "";

	canStart(): boolean {
		return true;
	}

	parseChar(): AfterParseResult {
		this.parsedText += this.cursor.currentChar;
		return AfterParseResult.text;
	}

	toHtmlString(): string {
		if (this.modifyLineBreaks)
			return escapeHtml(this.parsedText
				.replace(P_Text.escapableCharsRegex, "$1"))
				.replace(/ {2,}\n/g, "<br>\n")					// replace double space at end of line with <br>
				.replace(/(?<!<br>)\s*\n(?=.+)/g, " ")			// remove all other line breaks
		else
			return escapeHtml(this.parsedText);
	}

}
