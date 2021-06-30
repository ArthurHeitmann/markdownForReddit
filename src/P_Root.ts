import {P_Block} from "./P_Block.js";
import {P_Parser, ParserConstrSignature, ParsingState,} from "./P_Parser.js";

export class P_Root extends P_Parser {
	possibleChildren: ParserConstrSignature[] = [P_Block];
	canChildrenRepeat: boolean = true;

	constructor(state: ParsingState) {
		super(state);
	}
}
