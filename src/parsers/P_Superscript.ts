import {AfterParseResult, P_Parser, ParserType, ParsingState} from "./P_Parser.js";
import {BasicTextChildOptions, BasicTextOptions, P_BasicText} from "./P_BasicText.js";
import {ParsingCursor} from "../parsingCursor.js";

/** Superscripted inline text. Follows pattern of "^word" or "^(multiple word)". Containing text can be styled. */
export class P_Superscript extends P_Parser {
	id: string = "superscript";
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [ParserType.from(P_BasicText)];

	private parsedStartChars = "";
	private usesParentheses: boolean;
	private parseState: ParsingState = ParsingState.notStarted;

	constructor(cursor: ParsingCursor, options: BasicTextChildOptions = {}) {
		super(cursor);

		if (options.allowLinks)
			(this.possibleChildren[0] as BasicTextOptions).allowLinks = true;
	}

	canStart(): boolean {
		return /^\^(\S+|(\(.*\)))/s.test(this.cursor.remainingText) && this.cursor.previousChar !== "\\";
	}

	parseChar(): AfterParseResult {
		if (this.parseState === ParsingState.notStarted) {
			this.usesParentheses = this.cursor.remainingText[1] === "(";
			if (this.usesParentheses)
				this.parseState = ParsingState.start;
			else
				this.parseState = ParsingState.content;
			this.parsedStartChars += this.cursor.currentChar;
			return AfterParseResult.consumed;
		}

		if (this.parseState === ParsingState.start) {
			this.parsedStartChars += this.cursor.currentChar;
			this.parseState = ParsingState.content;
			return  AfterParseResult.consumed;
		}

		if (this.parseState === ParsingState.content) {
			if (this.usesParentheses && this.cursor.currentChar === ")") {
				this.parseState = ParsingState.completed;
				return AfterParseResult.ended;
			}
			if (!this.usesParentheses && /\s/.test(this.cursor.remainingText[1] ?? " ")) {
				this.parseState = ParsingState.completed;
				super.parseChar();
				return AfterParseResult.ended;
			}
			return super.parseChar();
		}
	}

	toHtmlString(): string {
		if (this.parseState === ParsingState.completed || !this.usesParentheses)
			return `<sup>${super.toHtmlString()}</sup>`;
		else
			return `^${this.usesParentheses ? "(" : ""}${super.toHtmlString()}`;
	}
}