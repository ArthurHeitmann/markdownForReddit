import {P_Block} from "./P_Block.js";
import {P_Parser, ParserType} from "./P_Parser.js";
import {ParsingCursor} from "../parsingCursor.js";

export class P_Root extends P_Parser {
	id: string = "root";
	possibleChildren: ParserType[] = [ParserType.from(P_Block)];
	canChildrenRepeat: boolean = true;

	constructor(state: ParsingCursor) {
		super(state);
	}
}