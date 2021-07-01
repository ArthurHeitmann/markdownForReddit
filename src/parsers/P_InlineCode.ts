import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {P_Text} from "./P_Text.js";

enum InlineCodeParsingState {
	tickStart, wsStart, content, wsEnd, tickEnd, completed, error
}

export class P_InlineCode extends P_Parser {
	id: string = "InlineCode";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [ParserType.from(P_Text, false)];

	private parsedStartChars = "";
	private parsedEndChars = "";
	private backtickCount = 0;
	private backtickCountEnd = 0;
	private parsingState: InlineCodeParsingState = InlineCodeParsingState.tickStart;

	canStart(): boolean {
		return /^`+\s*/.test(this.cursor.remainingText);
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === InlineCodeParsingState.tickStart) {
			if (this.cursor.currentChar === "`") {
				this.backtickCount++;
				this.parsedStartChars += this.cursor.currentChar;
				return AfterParseResult.consumed;
			}
			if (/\s/.test(this.cursor.currentChar)) {
				this.parsedStartChars += this.cursor.currentChar;
				this.parsingState = InlineCodeParsingState.wsStart;
				return AfterParseResult.consumed;
			}
			else {
				this.parsingState = InlineCodeParsingState.content;
			}
		}

		if (this.parsingState === InlineCodeParsingState.wsStart) {
			if (/\s/.test(this.cursor.currentChar)) {
				this.parsedStartChars += this.cursor.currentChar;
				return AfterParseResult.consumed;
			}
			else {
				this.parsingState = InlineCodeParsingState.content;
			}
		}

		if (this.parsingState === InlineCodeParsingState.content) {
			if (new RegExp("^\\s*" + "`".repeat(this.backtickCount)).test(this.cursor.remainingText)) {
				if (/\s/.test(this.cursor.currentChar)) {
					this.parsingState = InlineCodeParsingState.wsEnd;
					return AfterParseResult.consumed;
				}
				else {
					this.parsingState = InlineCodeParsingState.tickEnd;
				}
			}
			else {
				super.parseChar();
				return AfterParseResult.consumed;
			}
		}

		if (this.parsingState === InlineCodeParsingState.wsEnd) {
			if (/\s/.test(this.cursor.currentChar)) {
				this.parsedEndChars += this.cursor.currentChar;
				return AfterParseResult.consumed;
			}
			else {
				this.parsingState = InlineCodeParsingState.tickEnd;
			}
		}

		if (this.parsingState === InlineCodeParsingState.tickEnd) {
			if (this.cursor.currentChar === "`") {
				this.parsedEndChars += this.cursor.currentChar;
				this.backtickCountEnd++;
				if (this.backtickCount === this.backtickCountEnd) {
					this.parsingState = InlineCodeParsingState.completed;
					return AfterParseResult.ended;
				}
				else {
					return AfterParseResult.consumed;
				}
			}
		}

		return super.parseChar();
	}

	canConsumeChar(): boolean {
		return !/^\s+$/.test(this.cursor.currentLine);		// empty lines end inline code, all other text is consumed
	}

	toHtmlString(): string {
		if (this.parsingState === InlineCodeParsingState.completed)
			return `<code>${super.toHtmlString()}</code>`;
		else
			return this.parsedStartChars + super.toHtmlString() + this.parsedEndChars;
	}
}