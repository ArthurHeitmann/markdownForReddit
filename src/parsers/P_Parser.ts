import {ParsingCursor} from "../parsingCursor.js";

export enum AfterParseResult {
	ended, consumed
}

type ParserConstrSignature = new (state: ParsingCursor, ...other: any) => P_Parser;

export class ParserType {
	private otherParams: any[];
	private constr: ParserConstrSignature;

	id: string;

	make(cursor: ParsingCursor): P_Parser {
		return new this.constr(cursor, ...this.otherParams);
	}

	static from(id: string, constr: ParserConstrSignature, ...otherParams: any): ParserType {
		const type = new ParserType();
		type.id = id;
		type.constr = constr;
		type.otherParams = otherParams;
		return type;
	}
}

export abstract class P_Parser {
	abstract possibleChildren: ParserType[];
	abstract canChildrenRepeat: boolean;
	protected cursor: ParsingCursor;
	protected children: P_Parser[] = [];
	protected parsingChild: P_Parser = null;

	constructor(state: ParsingCursor) {
		this.cursor = state;
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
		if (this.parsingChild === null) {
			for (const state of this.possibleChildren) {
				const newParser = state.make(this.cursor);
				if (newParser.canStart()) {
					this.parsingChild = newParser;
					this.children.push(newParser);
					break;
				}
			}
			if (this.parsingChild === null)
				throw new Error("Couldn't start parsing");
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
		else {
			throw new Error("wut?");
		}
	};

	canConsumeChar(): boolean {
		return this.parsingChild ? this.parsingChild.canConsumeChar() : false;
	}

	onParentEnd(): void {
		for (const child of this.children) {
			child.onParentEnd();
		}
	};

	toHtmlString(): string {
		return this.children.map(ch => ch.toHtmlString()).join("");
	};
}