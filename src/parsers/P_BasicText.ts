import {P_Parser, ParserType} from "./P_Parser.js";
import {P_StyledText} from "./P_StyledText.js";
import {P_Text} from "./P_Text.js";
import {P_InlineCode} from "./P_InlineCode.js";
import {P_Superscript} from "./P_Superscript.js";

export class P_BasicText extends P_Parser {
	id: string = "basicText"
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [
		ParserType.from(P_StyledText),
		ParserType.from(P_Superscript),
		ParserType.from(P_InlineCode),
		ParserType.from(P_Text)
	];

	constructor(state, excludedStyleTypes: string[] = []) {
		super(state);

		this.possibleChildren[0] = ParserType.from(P_StyledText, excludedStyleTypes);
	}
}
