import {AfterParseResult, P_Parser, ParserType, ParsingState} from "./P_Parser.js";
import {P_Block} from "./P_Block.js";

export class P_Quote extends P_Parser {
	id: string = "Quote";
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [ParserType.from(P_Block)];
	joinChars = "\n\n";

	private parsingState: ParsingState = ParsingState.start;

	canStart(): boolean {
		return this.cursor.currentLine.startsWith("> ");
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === ParsingState.start) {
			if (this.cursor.currentChar === " ") {
				this.parsingState = ParsingState.content;
				this.cursor.currentLine = this.cursor.currentLine.slice(2);
				this.cursor.column -= 2;
			}
			return AfterParseResult.consumed;
		}

		if (this.parsingState === ParsingState.content) {
			if (this.cursor.currentChar === "\n") {
				if (this.cursor.nextLine.startsWith("> ")) {
					this.cursor.nextLine = this.cursor.nextLine.slice(2);
					super.parseChar();
					this.parsingState = ParsingState.start;
					return AfterParseResult.consumed;
				}
				this.parsingState = ParsingState.completed;
				return AfterParseResult.ended;
			} else if (this.cursor.isLastChar) {
				super.parseChar();
				return AfterParseResult.ended;
			}
			super.parseChar();
			return AfterParseResult.consumed
		}
	}

	toHtmlString(): string {
		return `<blockquote>\n${super.toHtmlString()}\n</blockquote>`;
	}
}