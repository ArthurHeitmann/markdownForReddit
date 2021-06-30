import {AfterParseResult, P_Parser, ParserConstrSignature} from "./P_Parser.js";
import {P_SimpleText} from "./P_SimpleText.js";

export class P_Paragraph extends P_Parser {
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserConstrSignature[] = [P_SimpleText];

	parse(): AfterParseResult {
		if (
			this.state.column + 1 === this.state.currentLine.length
			&&
			(this.state.nextLine === null || /^\s*\n$/.test(this.state.nextLine))
		) {
			this.onParentEnd();
			return AfterParseResult.ended;
		}
		else {
			return super.parse();
		}
	}

	toHtmlString(): string {
		return `<p>${super.toHtmlString()}</p>`;
	}
}
