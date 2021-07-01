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

	constructor(markdown: string) {
		this.allText = markdown;
		this.allLines = markdown.split("\n").map(line => `${line}\n`);
		this.currentLine = this.allLines[0];
		this.nextLine = this.allLines[1] ?? null;
		this.remainingText = markdown;
		this.currentChar = markdown[0];
	}

	moveCursor() {
		this.charIndex++;
		this.currentChar = this.allText[this.charIndex];
		this.remainingText = this.allText.slice(this.charIndex);
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