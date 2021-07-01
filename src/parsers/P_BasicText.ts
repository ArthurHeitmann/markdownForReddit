import {P_Parser, ParserType} from "./P_Parser.js";
import {P_StyledText} from "./P_StyledText.js";
import {P_Text} from "./P_Text.js";

export class P_BasicText extends P_Parser {
	static id = "basicText"
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [ParserType.from(P_StyledText.id, P_StyledText), ParserType.from(P_Text.id, P_Text)];

	constructor(state, excludedStyleTypes: string[] = []) {
		super(state);

		this.possibleChildren[0] = ParserType.from(P_StyledText.id, P_StyledText, excludedStyleTypes);
	}
}
