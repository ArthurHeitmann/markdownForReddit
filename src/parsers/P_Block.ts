import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {P_Paragraph} from "./P_Paragraph.js";
import {P_CodeMultilineSpaces} from "./P_CodeMultilineSpaces.js";
import {P_CodeMultilineFenced} from "./P_CodeMultilineFenced.js";
import {P_HorizontalLine} from "./P_HorizontalLine.js";
import {P_Quote} from "./P_Quote.js";
import {P_Heading} from "./P_Heading.js";

export class P_Block extends P_Parser {
	id: string = "block";
	possibleChildren: ParserType[] = [
		ParserType.from(P_Quote),
		ParserType.from(P_CodeMultilineSpaces),
		ParserType.from(P_CodeMultilineFenced),
		ParserType.from(P_Heading),
		ParserType.from(P_HorizontalLine),
		ParserType.from(P_Paragraph)
	];
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
