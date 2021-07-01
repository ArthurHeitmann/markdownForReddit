import {P_Parser, ParserType} from "./P_Parser.js";
import {P_BasicText} from "./P_BasicText.js";

export class P_SimpleText extends P_Parser {
	id: string = "simpleText";
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [ParserType.from(P_BasicText)];
}
