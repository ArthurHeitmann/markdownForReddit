import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {BasicTextOptions, P_BasicText} from "./P_BasicText.js";

export class P_Paragraph extends P_Parser {
	id: string = "paragraph";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [ParserType.from(P_BasicText, <BasicTextOptions> { allowLinks: true })];

	parseChar(): AfterParseResult {
		if (
			this.cursor.column + 1 === this.cursor.currentLine.length
			&&
			(this.cursor.nextLine === null || /^\s*\n$/.test(this.cursor.nextLine))
		) {
			return AfterParseResult.ended;
		}
		else {
			return super.parseChar();
		}
	}

	toHtmlString(): string {
		return `<p>${super.toHtmlString().replace(/^\s*|\s*$/g, "")}</p>`;
	}
}
