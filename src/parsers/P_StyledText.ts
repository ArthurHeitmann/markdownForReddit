import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {P_BasicText} from "./P_BasicText.js";
import {ParsingCursor} from "../parsingCursor.js";

interface StyleType {
	charSequence: string;
	charSequenceEnd?: string;
	tagName: string;
	tagOther?: string;
}

export class P_StyledText extends P_Parser {
	static id = "styledText";
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [];

	private static styleTypes: StyleType[] = [
		{ charSequence: "**", tagName: "strong" },
		{ charSequence: "__", tagName: "strong" },
		{ charSequence: "*", tagName: "em" },
		{ charSequence: "_", tagName: "em" },
		{ charSequence: "~~", tagName: "del" },
		{ charSequence: ">!", charSequenceEnd: "!<", tagName: "span", tagOther: ` class="md-spoiler-text"` },

	];
	private excludedCharSeq: string[];
	private parsingState: "notStarted" | "start" | "content" | "end" | "completed" = "notStarted";
	private styleType: StyleType = null
	private parsedStartChars = "";
	private parsedEndChars = "";

	constructor(cursor: ParsingCursor, excludedCharSeq: string[] = []) {
		super(cursor);
		this.excludedCharSeq = excludedCharSeq;
	}

	canStart(): boolean {
		for (const styleType of P_StyledText.styleTypes) {
			if (
				!this.excludedCharSeq.includes(styleType.charSequence)
				&&
				this.cursor.remainingText.startsWith(styleType.charSequence)						// starts with right chars
				&&
				/^(?!\s)/.test(this.cursor.remainingText.slice(styleType.charSequence.length))		// isn't followed by \s
			) {
				return true;
			}
		}
		return false
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === "notStarted") {
			for (const styleType of P_StyledText.styleTypes) {
				if (
					!this.excludedCharSeq.includes(styleType.charSequence)
					&&
					this.cursor.remainingText.startsWith(styleType.charSequence)
				) {
					this.styleType = styleType;
					break;
				}
			}
			this.possibleChildren[0] = ParserType.from(P_BasicText.id, P_BasicText, this.excludedCharSeq.concat(this.styleType.charSequence));
			this.parsingState = "start";
		}

		if (this.parsingState === "start") {
			this.parsedStartChars += this.cursor.currentChar;
			if (this.parsedStartChars === this.styleType.charSequence)
				this.parsingState = "content";
			return AfterParseResult.consumed;
		}

		if (this.parsingState === "content") {
			if (
				this.cursor.remainingText.startsWith(this.getCharSequenceEnd())
				&&
				this.parsingChild && !this.parsingChild.canConsumeChar()
			) {
				this.parsingState = "end";
			}
			else {
				return super.parseChar();
			}
		}

		if (this.parsingState === "end") {
			this.parsedEndChars += this.cursor.currentChar;
			if (this.parsedEndChars === this.getCharSequenceEnd()) {
				this.parsingState = "completed";
				return AfterParseResult.ended;
			}
			return AfterParseResult.consumed;
		}
	}

	canConsumeChar(): boolean {
		const remainingEndChars = this.getCharSequenceEnd().slice(this.parsedEndChars.length);
		return this.cursor.remainingText.startsWith(remainingEndChars) || super.canConsumeChar();
	}

	toHtmlString(): string {
		if (this.parsingState === "completed")
			return `<${this.styleType.tagName}${this.styleType.tagOther ?? ""}>${super.toHtmlString()}</${this.styleType.tagName}>`;
		else
			return `${this.parsedStartChars}${super.toHtmlString()}${this.parsedEndChars}`
	}

	private getCharSequenceEnd(): string {
		return this.styleType.charSequenceEnd ?? this.styleType.charSequence;
	}
}
