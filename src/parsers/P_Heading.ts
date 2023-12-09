import {AfterParseResult, P_Parser, ParserType, ParsingState} from "./P_Parser.js";
import {BasicTextOptions, P_BasicText} from "./P_BasicText.js";

/** A h1, h2, ..., h6 heading. Starts with 1 - 6 "#". */
export class P_Heading extends P_Parser {
	id: string = "Heading";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [ParserType.from(P_BasicText, <BasicTextOptions> { allowLinks: true })];

	private headingLevel: number = 0;
	private parsingState: ParsingState = ParsingState.start;

	canStart(): boolean {
		return /^#{1,6}.*(\n|$)/.test(this.cursor.currentLine);
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === ParsingState.start) {
			if (this.cursor.currentChar === "#") {
				this.headingLevel++;
				return AfterParseResult.consumed;
			}
			if (this.cursor.currentChar === " ") {
				this.parsingState = ParsingState.content;
				this.headingLevel = Math.min(6, this.headingLevel);
				return AfterParseResult.consumed;
			}
			this.headingLevel = Math.min(6, this.headingLevel);
			this.parsingState = ParsingState.content;
		}

		if (this.parsingState === ParsingState.content) {
			if (this.cursor.currentChar === "\n")
				return AfterParseResult.ended;
			if (this.cursor.isLastChar) {
				super.parseChar();
				return AfterParseResult.ended;
			}
			super.parseChar();
			return AfterParseResult.consumed;
		}

		return AfterParseResult.consumed;
	}

	toHtmlString(): string {
		return `<h${this.headingLevel}>${super.toHtmlString()}</h${this.headingLevel}>`;
	}
}