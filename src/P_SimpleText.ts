import {P_Parser, ParserConstrSignature} from "./P_Parser.js";
import {P_Text} from "./P_Text.js";

export class P_SimpleText extends P_Parser {
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserConstrSignature[] = [P_Text];
}
