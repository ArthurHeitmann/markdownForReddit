/**
 * Holds information about the current parsing state (column, current char, ...)
 */
export class ParsingCursor {
	/** All markdown text (doesn't change) */
	allText: string;
	/** Current row */
	row: number = 0;
	/** Current column (can be modified by parsing nodes) */
	column: number = 0;
	/** Current char index (of allText) */
	charIndex: number = 0;
	/** Array of All lines (doesn't change) */
	allLines: string[];
	/** Current line (can be modified by parsing nodes) */
	currentLine: string;
	/** Next line (null if no next line) (can be modified by parsing nodes) */
	nextLine: string;
	/** Slice of all text, starting from current char index. */
	remainingText: string;
	/** Currently parsing char */
	currentChar: string;
	/** Previously parsed char */
	previousChar: string = "";
	/** Previously parsed text */
	previousText: string = "";
	/** if there is no remaining text */
	isLastChar: boolean;

	constructor(markdown: string) {
		this.allText = markdown;
		this.allLines = markdown.split("\n").map(line => `${line}\n`);
		this.currentLine = this.allLines[0];
		this.nextLine = this.allLines[1] ?? null;
		this.remainingText = markdown;
		this.currentChar = markdown[0];
		this.isLastChar = markdown.length < 2;
	}

	incrementCursor() {
		this.charIndex++;
		this.column++;
		this.currentChar = this.allText[this.charIndex];
		this.previousChar = this.allText[this.charIndex - 1];
		this.previousText = this.allText.slice(0, this.charIndex);
		this.remainingText = this.allText.slice(this.charIndex);
		this.isLastChar = this.charIndex + 1 === this.allText.length;
		// reached end of current line
		if (this.column === this.currentLine.length) {
			this.row++;
			this.column = 0;
			this.currentLine = this.allLines[this.row];
			this.nextLine = this.allLines[this.row + 1] ?? null;
		}
	}
}