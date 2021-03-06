import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {P_Paragraph} from "./P_Paragraph.js";
import {P_CodeMultilineSpaces} from "./P_CodeMultilineSpaces.js";
import {P_CodeMultilineFenced} from "./P_CodeMultilineFenced.js";
import {P_HorizontalLine} from "./P_HorizontalLine.js";
import {P_Quote} from "./P_Quote.js";
import {P_Heading} from "./P_Heading.js";
import {P_Table} from "./P_Table.js";
import {ParsingCursor} from "../parsingCursor.js";
import {P_List} from "./P_List.js";

/** A block is one Element like a table, list or a text paragraph */
export class P_Block extends P_Parser {
	id: string = "block";
	possibleChildren: ParserType[] = [
		ParserType.from(P_Quote),
		ParserType.from(P_Table),
		ParserType.from(P_List),
		ParserType.from(P_CodeMultilineSpaces),
		ParserType.from(P_CodeMultilineFenced),
		ParserType.from(P_Heading),
		ParserType.from(P_HorizontalLine),
		ParserType.from(P_Paragraph)
	];
	canChildrenRepeat: boolean;

	hasBlockStarted = false;

	constructor(cursor: ParsingCursor, excludedTypeIds: string[] = []) {
		super(cursor);

		for (const excludedId of excludedTypeIds) {
			const possibleChildrenIndex = this.possibleChildren.findIndex(parser => {
				const newParser = parser.make(null);
				return newParser.id === excludedId;
			});
			this.possibleChildren.splice(possibleChildrenIndex, 1);
		}
	}

	parseChar(): AfterParseResult {
		if (!this.hasBlockStarted) {
			if (/^\s*\n$/.test(this.cursor.currentLine))
				return AfterParseResult.consumed;
			this.hasBlockStarted = true
		}

		return super.parseChar();
	}
}
