import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {P_Paragraph} from "./P_Paragraph.js";

export class P_Block extends P_Parser {
	id: string = "block";
	possibleChildren: ParserType[] = [ParserType.from(P_Paragraph)];
	canChildrenRepeat: boolean;

	hasBlockStarted = false;

	parseChar(): AfterParseResult {
		if (!this.hasBlockStarted) {
			if (/^\s*\n$/.test(this.cursor.currentLine))
				return AfterParseResult.consumed;
			this.hasBlockStarted = true
		}

		return super.parseChar();
	}
}
