import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";

export class P_HorizontalLine extends P_Parser {
	id: string = "HorizontalLine";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [];

	canStart(): boolean {
		return /^(-{3,}|\*{3,}|_{3,})(\n|$)/.test(this.cursor.currentLine);
	}

	parseChar(): AfterParseResult {
		return ["-", "*", "_"].includes(this.cursor.currentChar) ? AfterParseResult.consumed : AfterParseResult.ended;
	}

	toHtmlString(): string {
		return `<hr>`;
	}
}