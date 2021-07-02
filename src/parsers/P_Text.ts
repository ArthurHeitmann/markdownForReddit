import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import escapeHtml from "escape-html";
import {ParsingCursor} from "../parsingCursor.js";

export class P_Text extends P_Parser {
	id: string = "text";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [];

	private static escapableCharsRegex = /\\([`~*_\-\\>\]^])/g;
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
			return  escapeHtml(this.parsedText)
				.replace(/ {2,}\n/g, "<br>\n")					// replace double space at end of line with <br>
				.replace(/(?<!<br>)\s*\n(?=.+)/g, " ")			// remove all other line breaks
				.replace(P_Text.escapableCharsRegex, "$1")
		else
			return escapeHtml(this.parsedText);
	}

}
