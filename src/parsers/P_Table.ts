import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {BasicTextOptions, P_BasicText} from "./P_BasicText.js";

type alignment = "" | "left" | "right" | "center";

enum TableParsingState {
	header, divider , rows
}

enum DataRowParsingState {
	pipe, leadingWs, content, end, completed
}

enum DividerParsingState {
	pipe, firstChar, spacer, lastChar, completed
}

/**
 * A markdown table. Consists of a header row, a divider row, and a number of content rows.
 *
 * Example:
 * | Header 1 | H 2     |
 * |----------|:-------:|
 * | row 1 c1 | cell 2  |
 * | row 2    | c2      |
 * | formatting doesn't matter | that much |
 *
 * (here the H 2 column will be center formatted)
 */
export class P_Table extends P_Parser {
	id: string = "table";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [ParserType.from(P_BasicText,  <BasicTextOptions> { allowLinks: true })];

	private parsingState: TableParsingState = TableParsingState.header;
	private dataRowParsingState: DataRowParsingState = DataRowParsingState.pipe;
	private dividerParsingState: DividerParsingState = DividerParsingState.pipe;
	private columns: number = 0;
	private currentColumn: number = 0;
	private currentRow: number = 0;
	private columnAlignment: alignment[] = [];
	private headerValues: P_BasicText[] = [];
	private cellValues: P_BasicText[][] = [];

	canStart(): boolean {
		const headerPipes = P_Table.countRowPipes(this.cursor.currentLine);
		const dividerPipes = P_Table.countRowPipes(this.cursor.nextLine);
		return headerPipes >= 2 && dividerPipes >= 2 && (
			/^\|((.*[^\\]|)\|+) *\n/.test(this.cursor.currentLine) &&
			/^\|([:\- ]*\|+)+ *(\n|$)/.test(this.cursor.nextLine)
		);
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === TableParsingState.header) {
			return this.parseDataRow(
				() => this.headerValues.push(new P_BasicText(this.cursor)),
				() => this.headerValues[this.headerValues.length - 1].parseChar(),
				() => this.columns++,
				() => {
					this.parsingState = TableParsingState.divider;
					return AfterParseResult.consumed;
				}
			)
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
				if (this.cursor.currentChar === ":") {
					this.columnAlignment[this.currentColumn] = "left";
					if (this.cursor.remainingText[2] === "|")
						this.dividerParsingState = DividerParsingState.lastChar;
					else
						this.dividerParsingState = DividerParsingState.spacer;
				}
				else {
					if (this.cursor.remainingText[1] === "|") {
						this.dividerParsingState = DividerParsingState.pipe;
						this.currentColumn++;
					}
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
				this.currentColumn++;
			}
			else if (this.dividerParsingState === DividerParsingState.completed) {
				if (this.cursor.currentChar === "\n") {
					if (P_Table.countRowPipes(this.cursor.nextLine) >= 2) {
						this.dataRowParsingState = DataRowParsingState.pipe;
						this.parsingState = TableParsingState.rows;
						this.currentColumn = 0;
						this.cellValues.push([]);
					}
					else
						return AfterParseResult.ended;
				}
			}
			return AfterParseResult.consumed;
		}

		else if (this.parsingState === TableParsingState.rows) {
			return this.parseDataRow(
				() => this.cellValues[this.currentRow].push(new P_BasicText(this.cursor, <BasicTextOptions> { allowLinks: true })),
				() => this.cellValues[this.currentRow][this.currentColumn].parseChar(),
				() => this.currentColumn++,
				() => {
					if (P_Table.countRowPipes(this.cursor.nextLine) < 2)
						return AfterParseResult.ended;
					else {
						this.currentRow++;
						this.currentColumn = 0;
						this.dataRowParsingState = DataRowParsingState.pipe;
						this.cellValues.push([]);
						return AfterParseResult.consumed;
					}
				}
			);
		}

		return AfterParseResult.consumed;
	}

	toHtmlString(): string {
		let out = "<table><thead>\n<tr>\n";
		for (let i = 0; i < this.columns; ++i) {
			out += `<th${this.columnAlignment[i] ? ` align="${this.columnAlignment[i]}"` : ""}>${this.headerValues[i].toHtmlString()}</th>\n`
		}
		out += `</tr>\n</thead><tbody>\n`;
		for (const row of this.cellValues) {
			out += `<tr>\n`;
			for (let i = 0; i < this.columns; ++i) {
				const colspan = !row[i] && i + 1 !== this.columns ? ` colspan="${this.columns - i}"` : "";
				const align = this.columnAlignment[i] ? ` align="${this.columnAlignment[i]}"` : "";
				const phantomSpace = colspan && align ? " " : "";
				out += `<td${colspan}${phantomSpace}${align}>${row[i]?.toHtmlString() ?? ""}</td>\n`;
				if (colspan)
					break;
			}
			out += `</tr>\n`;
		}
		out += `</tbody></table>`;
		return out;
	}

	private parseDataRow(onInitContent: () => void, onParseChar: () => void, onColumnCompleted: () => void, onRowCompleted: () => AfterParseResult): AfterParseResult {
		if (this.dataRowParsingState === DataRowParsingState.pipe) {
			if (/^\|\s*(\n|$)/.test(this.cursor.remainingText)) {
				this.dataRowParsingState = DataRowParsingState.completed;
			}
			else {
				onInitContent();
				if (this.cursor.remainingText[1] === " ")
					this.dataRowParsingState = DataRowParsingState.leadingWs;
				else if (this.cursor.remainingText[1] === "|") {
					onColumnCompleted();
					this.dataRowParsingState = DataRowParsingState.pipe;
				}
				else if (/^\| *\n/.test(this.cursor.remainingText))
					this.dataRowParsingState = DataRowParsingState.completed;
				else
					this.dataRowParsingState = DataRowParsingState.content;
			}
		}
		else if (this.dataRowParsingState === DataRowParsingState.leadingWs) {
			if (this.cursor.remainingText[1] === "|") {
				this.dataRowParsingState = DataRowParsingState.pipe;
				onColumnCompleted();
			}
			else if (this.cursor.remainingText[1] !== " ")
				this.dataRowParsingState = DataRowParsingState.content;
		}
		else if (this.dataRowParsingState === DataRowParsingState.content) {
			this.cursor.isNewNode = true;
			onParseChar();
			if (this.cursor.remainingText[1] === "|" && this.cursor.currentChar !== "\\") {
				this.dataRowParsingState = DataRowParsingState.pipe;
				onColumnCompleted();
			}
			else if (/^(. +|[^\\])\|/.test(this.cursor.remainingText))
				this.dataRowParsingState = DataRowParsingState.end;
		}
		else if (this.dataRowParsingState === DataRowParsingState.end) {
			if (this.cursor.remainingText[1] === "|") {
				onColumnCompleted();
				if (/^ *\| *\n/.test(this.cursor.remainingText))
					this.dataRowParsingState = DataRowParsingState.completed;
				else
					this.dataRowParsingState = DataRowParsingState.pipe;
			}
		}
		else if (this.dataRowParsingState === DataRowParsingState.completed) {
			if (this.cursor.currentChar === "\n")
				return  onRowCompleted();
		}

		return AfterParseResult.consumed;
	}

	private static countRowPipes(row: string): number {
		return row?.match(/(^|[^\\])\|/g)?.length ?? 0;
	}
}
