export class ParsingCursor {
	allText: string;
	row: number = 0;
	column: number = 0;
	charIndex: number = 0;
	allLines: string[];
	currentLine: string;
	nextLine: string;
	lineStart: number = 0;
	remainingText: string;
	currentChar: string;
	previousChar: string = "";
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

	moveCursor() {
		this.charIndex++;
		this.currentChar = this.allText[this.charIndex];
		this.previousChar = this.allText[this.charIndex - 1];
		this.remainingText = this.allText.slice(this.charIndex);
		this.isLastChar = this.charIndex + 1 === this.allText.length;
		// reached end of current line
		if (this.column + 1 === this.currentLine.length) {
			this.row++;
			this.column = 0;
			this.currentLine = this.allLines[this.row];
			this.nextLine = this.allLines[this.row + 1] ?? null;
			this.lineStart = 0;
		}
		// still on same line
		else {
			this.column++;
		}
	}
}