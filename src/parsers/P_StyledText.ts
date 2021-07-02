import {AfterParseResult, P_Parser, ParserType, ParsingState} from "./P_Parser.js";
import {P_BasicText} from "./P_BasicText.js";
import {ParsingCursor} from "../parsingCursor.js";
import {escapeHtml, escapeRegex} from "../utils.js";

interface StyleType {
	charSequence: string;
	charSequenceEnd?: string;
	tagName: string;
	tagOther?: string;
	noMidWordEnd?: boolean;
}

export class P_StyledText extends P_Parser {
	id: string = "styledText";
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [];

	private static styleTypes: StyleType[] = [
		{ charSequence: "**", tagName: "strong" },
		{ charSequence: "__", tagName: "strong" },
		{ charSequence: "*", tagName: "em" },
		{ charSequence: "_", tagName: "em", noMidWordEnd: true },
		{ charSequence: "~~", tagName: "del" },
		{ charSequence: ">!", charSequenceEnd: "!<", tagName: "span", tagOther: ` class="md-spoiler-text"` },

	];
	private excludedCharSeq: string[];
	private parsingState: ParsingState = ParsingState.notStarted;
	private styleType: StyleType = null;
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
				// starts & ends with right chars
				new RegExp("^" + escapeRegex(styleType.charSequence) + ".*" + escapeRegex(styleType.charSequenceEnd || styleType.charSequence), "s").test(this.cursor.remainingText)
				&&
				/^(?!\s)/.test(this.cursor.remainingText.slice(styleType.charSequence.length))		// isn't followed by \s
				&&
				this.cursor.previousChar !== "\\"													// isn't escaped
			) {
				return true;
			}
		}
		return false
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === ParsingState.notStarted) {
			for (const styleType of P_StyledText.styleTypes) {
				if (
					!this.excludedCharSeq.includes(styleType.charSequence)
					&&
					new RegExp("^" + escapeRegex(styleType.charSequence) + ".*" + escapeRegex(styleType.charSequenceEnd || styleType.charSequence), "s").test(this.cursor.remainingText)
				) {
					this.styleType = styleType;
					break;
				}
			}
			this.possibleChildren[0] = ParserType.from(P_BasicText, this.excludedCharSeq.concat(this.styleType.charSequence));
			this.parsingState = ParsingState.start;
		}

		if (this.parsingState === ParsingState.start) {
			this.parsedStartChars += this.cursor.currentChar;
			if (this.parsedStartChars === this.styleType.charSequence)
				this.parsingState = ParsingState.content;
			return AfterParseResult.consumed;
		}

		if (this.parsingState === ParsingState.content) {
			const afterEscapeText = this.cursor.remainingText.slice(this.getCharSequenceEnd().length);
			if (
				this.cursor.remainingText.startsWith(this.getCharSequenceEnd())
				&&
				!(this.styleType.noMidWordEnd && /^\S/.test(afterEscapeText))
				&&
				this.parsingChild && !this.parsingChild.canConsumeChar()
			) {
				this.parsingState = ParsingState.end;
			}
			else {
				return super.parseChar();
			}
		}

		if (this.parsingState === ParsingState.end) {
			this.parsedEndChars += this.cursor.currentChar;
			if (this.parsedEndChars === this.getCharSequenceEnd()) {
				this.parsingState = ParsingState.completed;
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
		if (this.parsingState === ParsingState.completed)
			return `<${this.styleType.tagName}${this.styleType.tagOther ?? ""}>${super.toHtmlString()}</${this.styleType.tagName}>`;
		else
			return `${escapeHtml(this.parsedStartChars)}${super.toHtmlString()}${escapeHtml(this.parsedEndChars)}`
	}

	private getCharSequenceEnd(): string {
		return this.styleType.charSequenceEnd ?? this.styleType.charSequence;
	}
}
