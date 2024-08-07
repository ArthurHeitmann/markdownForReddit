import {AfterParseResult, P_Parser, ParserType, ParsingState} from "./P_Parser.js";
import {P_Text} from "./P_Text.js";

/**
 * Code that is surrounded by 3 or more "`" on new lines. Incompatible with old reddit, therefore the new reddit
 *  version is used here.
 */
export class P_CodeMultilineFenced extends P_Parser {
	id: string = "CodeMultilineSpaces";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [ParserType.from(P_Text, false, true)];

	private parsingState: ParsingState = ParsingState.start;
	private parsedStartTicks = 0;

	canStart(): boolean {
		return this.cursor.column === 0 && /^(`{3,})\n[\s\S]*\n\1($|\n)/.test(this.cursor.remainingText);
	}

	canConsumeChar(): boolean {
		return true;
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === ParsingState.start) {
			if (this.cursor.currentChar === "\n")
				this.parsingState = ParsingState.content;
			else
				this.parsedStartTicks++;
			return AfterParseResult.consumed;
		}

		if (this.parsingState === ParsingState.content) {
			if (this.cursor.currentChar === "\n" && this.cursor.nextLine === "`".repeat(this.parsedStartTicks) + "\n") {
				this.parsingState = ParsingState.end;
				return AfterParseResult.consumed;
			}
			super.parseChar();
			return AfterParseResult.consumed;
		}

		if (this.parsingState === ParsingState.end) {
			if (this.cursor.currentChar === "\n" || this.cursor.isLastChar) {
				this.parsingState = ParsingState.completed;
				return AfterParseResult.ended;
			}
			return AfterParseResult.consumed;
		}

		return AfterParseResult.consumed;
	}

	toHtmlString(): string {
		if (this.parsingState === ParsingState.completed)
			return `<pre><code>${super.toHtmlString()}\n</code></pre>`;
		else
			return `${"`".repeat(this.parsedStartTicks)}${super.toHtmlString()}`;
	}
}
