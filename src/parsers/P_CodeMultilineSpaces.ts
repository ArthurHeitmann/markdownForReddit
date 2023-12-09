import {AfterParseResult, P_Parser, ParserType, ParsingState} from "./P_Parser.js";
import {P_Text} from "./P_Text.js";

/** A code block, where each line start with 4 spaces */
export class P_CodeMultilineSpaces extends P_Parser {
	id: string = "CodeMultilineSpaces";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [ParserType.from(P_Text, false, true)];

	private parsingState: ParsingState = ParsingState.start;
	private parsedStartSpaces = 0;

	canStart(): boolean {
		return this.cursor.column === 0 && /^( {4}|\t)/.test(this.cursor.currentLine);
	}

	canConsumeChar(): boolean {
		return true;
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === ParsingState.content) {
			if (this.cursor.column === 0) {
				this.parsedStartSpaces = 0;
				this.parsingState = ParsingState.start;
			}
			else {
				if (this.cursor.currentChar === "\n") {
					if (!/^( {4}|\t)/.test(this.cursor.nextLine))
						return AfterParseResult.ended;
					super.parseChar();
				}
				else
					super.parseChar();
				return AfterParseResult.consumed;
			}
		}

		if (this.parsingState === ParsingState.start) {
			this.parsedStartSpaces++;
			if (this.parsedStartSpaces === 4 || this.cursor.currentChar === "\t")
				this.parsingState = ParsingState.content;
			return AfterParseResult.consumed;
		}

		return AfterParseResult.consumed;
	}

	toHtmlString(): string {
		return `<pre><code>${super.toHtmlString()}\n</code></pre>`;
	}
}