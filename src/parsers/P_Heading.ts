import {AfterParseResult, P_Parser, ParserType, ParsingState} from "./P_Parser.js";
import {P_BasicText} from "./P_BasicText.js";

export class P_Heading extends P_Parser {
	id: string = "Heading";
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [ParserType.from(P_BasicText)];

	private headingLevel: number = 0;
	private parsingState: ParsingState = ParsingState.start;

	canStart(): boolean {
		return /^#{1,6} .+(\n|$)/.test(this.cursor.currentLine);
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === ParsingState.start) {
			if (this.cursor.currentChar === " ") {
				this.parsingState = ParsingState.content;
				return AfterParseResult.consumed;
			}
			else if (this.parsingState) {
				this.headingLevel++;
				return AfterParseResult.consumed;
			}
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
	}

	toHtmlString(): string {
		return `<h${this.headingLevel}>${super.toHtmlString()}</h${this.headingLevel}>`;
	}
}