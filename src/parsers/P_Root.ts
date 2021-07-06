import {P_Block} from "./P_Block.js";
import {P_Parser, ParserType} from "./P_Parser.js";

/** Per parsed markdown text there is one root node. It contains a list of blocks */
export class P_Root extends P_Parser {
	id: string = "root";
	possibleChildren: ParserType[] = [ParserType.from(P_Block)];
	canChildrenRepeat: boolean = true;
	joinChars = "\n\n";
}
