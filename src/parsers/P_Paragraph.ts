import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {P_SimpleText} from "./P_SimpleText.js";

export class P_Paragraph extends P_Parser {
	id: string = "paragraph";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [ParserType.from(P_SimpleText)];

	parseChar(): AfterParseResult {
		if (
			this.cursor.column + 1 === this.cursor.currentLine.length
			&&
			(this.cursor.nextLine === null || /^\s*\n$/.test(this.cursor.nextLine))
		) {
			this.onParentEnd();
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
