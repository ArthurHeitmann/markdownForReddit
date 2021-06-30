import {AfterParseResult, P_Parser, ParserConstrSignature} from "./P_Parser.js";
import {P_Paragraph} from "./P_Paragraph.js";

export class P_Block extends P_Parser {
	possibleChildren: ParserConstrSignature[] = [P_Paragraph];
	canChildrenRepeat: boolean;

	hasBlockStarted = false;

	parse(): AfterParseResult {
		if (!this.hasBlockStarted) {
			if (/^\s*\n$/.test(this.state.currentLine))
				return AfterParseResult.consumed;
			this.hasBlockStarted = true
		}

		return super.parse();
	}
}
