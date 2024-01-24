import {AfterParseResult, P_Parser, ParserType, ParsingState} from "./P_Parser.js";
import {P_Block} from "./P_Block.js";

/**
 * A quote (blockquote) starts on each line with "> ".
 * Inside a quote can be a list of blocks.
 */
export class P_Quote extends P_Parser {
	id: string = "Quote";
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [ParserType.from(P_Block)];
	joinChars = "\n\n";

	private parsingState: ParsingState = ParsingState.start;
	private nextLineBackup: string;
	private spaceAfterStart: boolean = true;

	canStart(): boolean {
		return this.cursor.currentLine.startsWith(">") && this.cursor.currentLine[1] !== "!";
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === ParsingState.start) {
			if (this.cursor.currentChar === ">" && (this.cursor.remainingText[1] !== " " || !this.spaceAfterStart)) {
				this.parsingState = ParsingState.content;
				this.spaceAfterStart = false;
				this.prepareCurrentLine(1);
			}
			else if (this.cursor.currentChar === " ") {
				this.parsingState = ParsingState.content;
				this.prepareCurrentLine(2);
			}
			if (this.cursor.currentChar === ">")
				this.prepareNextLine();
			return AfterParseResult.consumed;
		}

		if (this.parsingState === ParsingState.content) {
			if (this.cursor.currentChar === "\n") {
				if (this.nextLineBackup.startsWith(">") && this.nextLineBackup[1] !== "!") {
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
		
		return AfterParseResult.consumed;
	}

	toHtmlString(): string {
		return `<blockquote>\n${super.toHtmlString()}\n</blockquote>`;
	}

	private prepareCurrentLine(start: number) {
		this.cursor.currentLine = this.cursor.currentLine.slice(start);
		this.cursor.column -= start;
	}

	private prepareNextLine() {
		this.nextLineBackup = this.cursor.nextLine;
		if (this.cursor?.nextLine?.[0] !== ">")
			return;
		if (this.cursor.nextLine.startsWith("> ") && this.spaceAfterStart)
			this.cursor.nextLine = this.cursor.nextLine.slice(2);
		else
			this.cursor.nextLine = this.cursor.nextLine.slice(1);
	}
}
