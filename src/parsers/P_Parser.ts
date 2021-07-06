import {ParsingCursor} from "../parsingCursor.js";

export enum AfterParseResult {
	ended, consumed, text
}

export enum ParsingState {
	notStarted, start, content, end, completed
}

type ParserConstrSignature = new (cursor: ParsingCursor, ...other: any) => P_Parser;

export class ParserType {
	private otherParams: any[];
	private constr: ParserConstrSignature;

	make(cursor: ParsingCursor): P_Parser {
		return new this.constr(cursor, ...this.otherParams);
	}

	static from(constr: ParserConstrSignature, ...otherParams: any): ParserType {
		const type = new ParserType();
		type.constr = constr;
		type.otherParams = otherParams;
		return type;
	}
}

export abstract class P_Parser {
	abstract id: string;
	abstract possibleChildren: ParserType[];
	abstract canChildrenRepeat: boolean;
	protected joinChars = "";
	protected cursor: ParsingCursor;
	children: P_Parser[] = [];
	protected parsingChild: P_Parser = null;
	private tryTextAlternative = false;

	constructor(cursor: ParsingCursor) {
		this.cursor = cursor;
	}

	canStart(): boolean {
		for (const state of this.possibleChildren) {
			const newState = state.make(this.cursor);
			if (newState.canStart())
				return true;
		}
		return false;
	};

	parseChar(): AfterParseResult {
		if (this.parsingChild === null || this.tryTextAlternative) {
			for (const state of this.possibleChildren) {
				const newParser = state.make(this.cursor);
				if (!(this.tryTextAlternative && newParser.id === "text") && newParser.canStart()) {
					this.parsingChild = newParser;
					this.children.push(newParser);
					break;
				}
			}
			if (this.parsingChild === null)
				throw new Error("Couldn't start parsing");
			this.tryTextAlternative = false
		}

		const parseResult = this.parsingChild.parseChar();

		if (parseResult === AfterParseResult.ended) {
			this.parsingChild = null;
			if (this.canChildrenRepeat && this.canStart()) {
				return AfterParseResult.consumed;
			}
			else {
				return AfterParseResult.ended;
			}
		}
		else if (parseResult === AfterParseResult.consumed) {
			return AfterParseResult.consumed;
		}
		else if (parseResult === AfterParseResult.text) {
			this.tryTextAlternative = true;
			return AfterParseResult.consumed;
		}
		else {
			throw new Error("wut?");
		}
	};

	canConsumeChar(): boolean {
		return this.parsingChild ? this.parsingChild.canConsumeChar() : false;
	}

	toHtmlString(): string {
		return this.children.map(ch => ch.toHtmlString()).join(this.joinChars);
	};
}