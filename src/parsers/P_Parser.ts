import {ParsingCursor} from "../parsingCursor.js";

export enum AfterParseResult {
	/** The node is done parsing */
	ended,
	/** The node parsed the char and can continue */
	consumed,
	/** The current node parsed just text. If the next char is a link or style, that should be chosen over normal
	 *  text */
	text
}

export enum ParsingState {
	notStarted, start, content, end, completed
}

/** Similar to "typeof P_Parser" */
type ParserConstrSignature = new (cursor: ParsingCursor, ...other: any) => P_Parser;

/** Wrapper for storing a P_Parser constructor with optional arguments */
export class ParserType {
	/** Class to be instanciated */
	private constr: ParserConstrSignature;
	/** Optional arguments passed to the constructor */
	private otherParams: any[];

	/** Instantiates the P_Parser sub class */
	make(cursor: ParsingCursor): P_Parser {
		return new this.constr(cursor, ...this.otherParams);
	}

	/**
	 * Makes a new P_Parser wrapper.
	 *
	 * @param constr Sub class of P_Parser
	 * @param otherParams Optional parameters passed to the constructor
	 */
	static from(constr: ParserConstrSignature, ...otherParams: any): ParserType {
		const type = new ParserType();
		type.constr = constr;
		type.otherParams = otherParams;
		return type;
	}
}

/** A general parsing node. */
export abstract class P_Parser {
	/** Id of a class. (barely used) */
	abstract id: string;
	/** List of possible child nodes */
	abstract possibleChildren: ParserType[];
	/** false: after child node has completed, this node has too completed;
	 * true: after child node completed, created new child node */
	abstract canChildrenRepeat: boolean;
	/** Child nodes HTML will be joined with these chars (can be overridden) */
	protected joinChars = "";
	/** Holds information about global current parsing state */
	protected cursor: ParsingCursor;
	/** Child nodes */
	children: P_Parser[] = [];
	/** Shorthand for last of this.children */
	protected parsingChild: P_Parser = null;
	/** If try try if following text can be styled/linked */
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
