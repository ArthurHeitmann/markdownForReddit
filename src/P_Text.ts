import {AfterParseResult, P_Parser, ParserConstrSignature} from "./P_Parser.js";
import escapeHtml from "escape-html";

export class P_Text extends P_Parser {
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserConstrSignature[] = [];

	private parsedText = "";

	canStart(): boolean {
		return true;
	}

	parse(): AfterParseResult {
		this.parsedText += this.state.currentChar;
		return AfterParseResult.consumed;
	}

	toHtmlString(): string {
		return  escapeHtml(this.parsedText);
	}
}
