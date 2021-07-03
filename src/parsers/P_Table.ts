import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {BasicTextOptions, P_BasicText} from "./P_BasicText.js";

type alignment = "" | "left" | "right" | "center";

enum TableParsingState {
	header, divider , rows
}

enum DataRowParsingState {
	start, content, end, completed
}

enum DividerParsingState {
	pipe, firstChar, spacer, lastChar, completed
}

export class P_Table extends P_Parser {
	id: string = "table";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [ParserType.from(P_BasicText,  <BasicTextOptions> { allowLinks: true })];

	private parsingState: TableParsingState = TableParsingState.header;
	private dataRowParsingState: DataRowParsingState = DataRowParsingState.start;
	private dividerParsingState: DividerParsingState = DividerParsingState.pipe;
	private columns: number = 0;
	private currentColumn: number = -1;
	private currentRow: number = 0;
	private columnAlignment: alignment[] = [];
	private headerValues: P_BasicText[] = [];
	private cellValues: P_BasicText[][] = [];

	canStart(): boolean {
		const headerPipes = P_Table.countRowPipes(this.cursor.currentLine);
		const dividerPipes = P_Table.countRowPipes(this.cursor.nextLine);
		return headerPipes === dividerPipes && (
			/^\|( .*? \|+) *\n/.test(this.cursor.currentLine) &&
			/^\|(:?-+?:?\|+)+ *(\n|$)/.test(this.cursor.nextLine)
		);
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === TableParsingState.header) {
			if (this.dataRowParsingState === DataRowParsingState.start) {
				if (this.cursor.currentChar !== " " && this.cursor.currentChar !== "|") {
					this.dataRowParsingState = DataRowParsingState.content;
					this.headerValues.push(new P_BasicText(this.cursor));
				}
			}
			if (this.dataRowParsingState === DataRowParsingState.content) {
				if (/^ +\|/.test(this.cursor.remainingText))
					this.dataRowParsingState = DataRowParsingState.end;
				else
					this.headerValues[this.headerValues.length - 1].parseChar();
			}
			if (this.dataRowParsingState === DataRowParsingState.end) {
				if (this.cursor.currentChar === "|") {
					this.columns++;
					if (/^\| *\n/.test(this.cursor.remainingText))
						this.dataRowParsingState = DataRowParsingState.completed;
					else
						this.dataRowParsingState = DataRowParsingState.start;
				}
			}
			if (this.dataRowParsingState === DataRowParsingState.completed) {
				if (this.cursor.currentChar === "\n")
					this.parsingState = TableParsingState.divider;
			}
			return AfterParseResult.consumed;
		}

		else if (this.parsingState === TableParsingState.divider) {
			if (this.dividerParsingState === DividerParsingState.pipe) {
				if(/^\| *\n/.test(this.cursor.remainingText)) {
					this.dividerParsingState = DividerParsingState.completed;
				}
				else
					this.dividerParsingState = DividerParsingState.firstChar;
			}
			else if (this.dividerParsingState === DividerParsingState.firstChar) {
				this.currentColumn++
				if (this.cursor.currentChar === ":") {
					this.columnAlignment[this.currentColumn] = "left";
					if (this.cursor.remainingText[2] === "|")
						this.dividerParsingState = DividerParsingState.lastChar;
					else
						this.dividerParsingState = DividerParsingState.spacer;
				}
				else {
					if (this.cursor.remainingText[1] === "|")
						this.dividerParsingState = DividerParsingState.pipe;
					else if (this.cursor.remainingText[2] === "|")
						this.dividerParsingState = DividerParsingState.lastChar;
					else
						this.dividerParsingState = DividerParsingState.spacer;
				}
			}
			else if (this.dividerParsingState === DividerParsingState.spacer) {
				if (this.cursor.remainingText[2] === "|")
					this.dividerParsingState = DividerParsingState.lastChar;
			}
			else if (this.dividerParsingState === DividerParsingState.lastChar) {
				if (this.cursor.currentChar === ":") {
					if (this.columnAlignment[this.currentColumn] === "left")
						this.columnAlignment[this.currentColumn] = "center";
					else
						this.columnAlignment[this.currentColumn] = "right";
				}
				this.dividerParsingState = DividerParsingState.pipe;
			}
			else if (this.dividerParsingState === DividerParsingState.completed) {
				if (this.cursor.currentChar === "\n") {
					if (P_Table.countRowPipes(this.cursor.nextLine) === this.columns + 1) {
						this.dataRowParsingState = DataRowParsingState.start;
						this.parsingState = TableParsingState.rows;
						this.currentColumn = -1;
						this.cellValues.push([]);
					}
					else
						return AfterParseResult.ended;
				}
			}
			return AfterParseResult.consumed;
		}

		else if (this.parsingState === TableParsingState.rows) {
			if (this.dataRowParsingState === DataRowParsingState.start) {
				if (this.cursor.currentChar !== " " && this.cursor.currentChar !== "|") {
					this.currentColumn++;
					this.dataRowParsingState = DataRowParsingState.content;
					this.cellValues[this.currentRow].push(new P_BasicText(this.cursor, <BasicTextOptions> { allowLinks: true }));
				}
			}
			if (this.dataRowParsingState === DataRowParsingState.content) {
				if (/^ +\|/.test(this.cursor.remainingText))
					this.dataRowParsingState = DataRowParsingState.end;
				else
					this.cellValues[this.currentRow][this.currentColumn].parseChar();
			}
			if (this.dataRowParsingState === DataRowParsingState.end) {
				if (this.cursor.currentChar === "|") {
					if (/^\| *\n/.test(this.cursor.remainingText))
						this.dataRowParsingState = DataRowParsingState.completed;
					else
						this.dataRowParsingState = DataRowParsingState.start;
				}
			}
			if (this.dataRowParsingState === DataRowParsingState.completed) {
				if (this.cursor.currentChar === "\n") {
					if (P_Table.countRowPipes(this.cursor.nextLine) !== this.columns + 1)
						return AfterParseResult.ended;
					else {
						this.currentRow++;
						this.currentColumn = -1;
						this.dataRowParsingState = DataRowParsingState.start;
						this.cellValues.push([]);
					}
				}
			}
			return AfterParseResult.consumed;
		}
	}

	toHtmlString(): string {
		let out = "<table><thead><tr>";
		for (let i = 0; i < this.columns; ++i) {
			out += `<th${this.columnAlignment[i] ? ` align="${this.columnAlignment[i]}"` : ""}>${this.headerValues[i].toHtmlString()}</th>`
		}
		out += `</tr></thead><tbody>`;
		for (const row of this.cellValues) {
			out += `<tr>`;
			for (let i = 0; i < this.columns; ++i) {
				out += `<td${this.columnAlignment[i] ? ` align="${this.columnAlignment[i]}"` : ""}>${row[i].toHtmlString()}</td>`
			}
			out += `</tr>`;
		}
		out += `</tbody></table>`;
		return out;
	}

	private static countRowPipes(row: string): number {
		return row?.match(/(?<!\\)\|/g)?.length ?? 0;
	}
}
