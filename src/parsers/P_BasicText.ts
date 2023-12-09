import {P_Parser, ParserType} from "./P_Parser.js";
import {P_StyledText, StyledTextOptions} from "./P_StyledText.js";
import {P_Text} from "./P_Text.js";
import {P_InlineCode} from "./P_InlineCode.js";
import {P_Superscript} from "./P_Superscript.js";
import {P_Link} from "./P_Link.js";
import { P_Image } from "./P_Image.js";

export interface BasicTextChildOptions {
	allowLinks?: boolean
}

export interface BasicTextOptions {
	excludedStyleTypes?: string[],
	allowLinks?: boolean
}

/** Simple text that can be styled or optionally have links */
export class P_BasicText extends P_Parser {
	id: string = "basicText"
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [
		ParserType.from(P_StyledText),
		ParserType.from(P_Superscript),
		ParserType.from(P_InlineCode),
		ParserType.from(P_Text)
	];

	constructor(cursor, options: BasicTextOptions = {}) {
		super(cursor);

		this.possibleChildren[0] = ParserType.from(P_StyledText, <StyledTextOptions> { excludedCharSeq: options.excludedStyleTypes || [] });
		if (options.allowLinks) {
			this.possibleChildren.splice(0, 0, ParserType.from(P_Link));
			this.possibleChildren.splice(1, 0, ParserType.from(P_Image));
			if (!this.possibleChildren[2].otherParams[0])
				this.possibleChildren[2].otherParams[0] = {};
			if (!this.possibleChildren[3].otherParams[0])
				this.possibleChildren[3].otherParams[0] = {};
			(this.possibleChildren[2].otherParams[0] as BasicTextChildOptions).allowLinks = true;
			(this.possibleChildren[3].otherParams[0] as BasicTextChildOptions).allowLinks = true;
		}
	}
}
