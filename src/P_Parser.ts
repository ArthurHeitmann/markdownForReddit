export interface ParsingState {
	allText: string;
	row: number;
	column: number;
	charIndex: number;
	allLines: string[];
	currentLine: string;
	nextLine: string;
	lineStart: number;
	currentChar: string;
}

export enum AfterParseResult {
	ended, consumed
}

export type ParserConstrSignature = new (state: ParsingState) => P_Parser;

export abstract class P_Parser {
	abstract possibleChildren: ParserConstrSignature[];
	abstract canChildrenRepeat: boolean;
	protected state: ParsingState;
	protected children: P_Parser[] = [];
	protected parsingChild: P_Parser = null;

	constructor(state: ParsingState) {
		this.state = state;
	}

	canStart(): boolean {
		for (const state of this.possibleChildren) {
			const newState = new state(this.state);
			if (newState.canStart())
				return true;
		}
		return false;
	};

	parse(): AfterParseResult {
		if (this.parsingChild === null) {
			for (const state of this.possibleChildren) {
				const newParser = new state(this.state);
				if (newParser.canStart()) {
					this.parsingChild = newParser;
					this.children.push(newParser);
					break;
				}
			}
			if (this.parsingChild === null)
				throw new Error("Couldn't start parsing");
		}

		const parseResult = this.parsingChild.parse();

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

	onParentEnd(): void {
		for (const child of this.children) {
			child.onParentEnd();
		}
	};

	// consume
	// pass on
	// error

	toHtmlString(): string {
		return this.children.map(ch => ch.toHtmlString()).join("");
	};
}