import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {ParsingCursor} from "../parsingCursor.js";
import {escapeHtml} from "../utils.js";

/**
 * Just text.
 * All text will be HTML escaped.
 * By default double spaces at line end will be replaced with <br/>.
 * Line breaks without double spaces will be replaced with one space.
 * For code blocks these features can be deactivated.
 */
export class P_Text extends P_Parser {
	id: string = "text";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [];

	private static escapableCharsRegex = /\\([`~*_\-\\><\]\[^\/])/g;
	private readonly modifyLineBreaks: boolean;
	private readonly preserveTabs: boolean;

	constructor(cursor: ParsingCursor, modifyLineBreaks = true, preserveTabs = false) {
		super(cursor);

		this.modifyLineBreaks = modifyLineBreaks;
		this.preserveTabs = preserveTabs;
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
		let text = this.parsedText;
		if (this.preserveTabs) {
			text = text.replace(/\t/g, "    ")
		}
		else {
			text = text.replace(/\t/g, " ")
		}
		if (this.modifyLineBreaks) {
			text = text.replace(P_Text.escapableCharsRegex, "$1");
			text = escapeHtml(text)
			text = text.replace(/ {2,}\n/g, "<br/>\n")				// replace double space at end of line with <br/>
			text = text.replace(/(?<!<br\/>)\s*\n(?=.+)/g, " ")	// remove all other line breaks
		}
		else
			text = escapeHtml(text)

		return text;
	}

}
