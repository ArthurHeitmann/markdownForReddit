import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {P_BasicText} from "./P_BasicText.js";
import {P_Block} from "./P_Block.js";
import {P_Paragraph} from "./P_Paragraph.js";

enum ListParsingState {
	start, whitespace, content
}

enum ContentParsingState {
	text, blocks, sublist
}

interface Entry {
	textOnly: P_BasicText;
	blocks: P_Block[];
	sublist?: P_List;
}

interface ListTypeDefinition {
	initialStartRegex: RegExp;
	startRegex: RegExp;
	indentation: number;
	tagName: string;
}

export class P_List extends P_Parser {
	id: string = "list";
	canChildrenRepeat: boolean = true;
	possibleChildren: ParserType[] = [ParserType.from(P_Block, ["list"])];

	private static listTypes: ListTypeDefinition[] = [
		{
			initialStartRegex: /^[*-] /,
			startRegex: /^[*-] /,
			indentation: 2,
			tagName: "ul"
		},
		{
			initialStartRegex: /^1\. /,
			startRegex: /^\d+\. /,
			indentation: 3,
			tagName: "ol"
		}
	]
	private listType: ListTypeDefinition = null;
	private parsingState: ListParsingState = ListParsingState.start;
	private contentParsingState: ContentParsingState = ContentParsingState.text;
	private trimNextLine: boolean = false;
	private entries: Entry[] = [];
	private currentEntry: Entry = null;
	private parsedIndents = 0;
	private makeNewBlock: boolean = false;
	// following vars for sublist
	private isNewLine: boolean = true;
	private currentLineBackup: string = "";
	private nextLineBackup: string = "";

	canStart(): boolean {
		if (this.cursor.column !== 0)
			return false;
		for (const listType of P_List.listTypes) {
			if (listType.initialStartRegex.test(this.cursor.currentLine))
				return true;
		}
		return false;
	}

	parseChar(): AfterParseResult {
		if (this.listType === null) {
			for (const listType of P_List.listTypes) {
				if (listType.initialStartRegex.test(this.cursor.currentLine)) {
					this.listType = listType;
					break;
				}
			}
		}

		if (this.parsingState === ListParsingState.start) {
			if (this.cursor.column === 0) {
				this.currentLineBackup = this.cursor.currentLine;
				this.nextLineBackup = this.cursor.nextLine;
			}
			const startChars = this.currentLineBackup.match(this.listType.startRegex)[0];
			if (startChars.length - 1 === this.cursor.column) {
				this.parsingState = ListParsingState.content;
				this.contentParsingState = ContentParsingState.text;
				this.entries.push({
					textOnly: new P_BasicText(this.cursor),
					blocks: []
				});
				this.currentEntry = this.entries[this.entries.length - 1];
				this.cursor.currentLine = this.currentLineBackup.slice(startChars.length);
				this.currentLineBackup = this.cursor.currentLine;
				this.cursor.column -= startChars.length;
			}
		}

		else if (this.parsingState === ListParsingState.whitespace) {
			this.parsedIndents++;
			if (this.parsedIndents === this.listType.indentation) {
				this.parsingState = ListParsingState.content;
				this.trimNextLine = true;
				this.parsedIndents = 0;
			}
		}

		else if (this.parsingState === ListParsingState.content) {
			if (this.trimNextLine) {
				this.cursor.currentLine = this.cursor.currentLine.slice(this.listType.indentation);
				this.currentLineBackup = this.cursor.currentLine;
				this.nextLineBackup = this.cursor.nextLine;
				this.cursor.column -= this.listType.indentation;
				this.trimNextLine = false;
			}
			if (this.cursor.currentChar === "\n" && !(this.isNextLineStillIndented() || this.isNextLineNewEntry()))
				return AfterParseResult.ended;

			else if (this.contentParsingState === ContentParsingState.text) {
				this.currentEntry.textOnly.parseChar();
				if (this.cursor.currentChar === "\n") {
					if (this.isNextLineNewEntry())
						this.parsingState = ListParsingState.start;
					else if (this.isNextLineNestedList()) {
						this.parsingState = ListParsingState.whitespace;
						this.isNewLine = true;
						this.contentParsingState = ContentParsingState.sublist;
					}
					else if (/^\s*\n/.test(this.currentLineBackup) && this.isNextLineStillIndented() && !this.isNextLineNewEntry() && !this.isNextLineNestedList()) {
						this.parsingState = ListParsingState.whitespace;
						this.contentParsingState = ContentParsingState.blocks;
						const firstParagraph = new P_Paragraph(this.cursor);
						firstParagraph.children = [this.currentEntry.textOnly];
						const firstBlock = this.possibleChildren[0].make(this.cursor) as P_Block;
						firstBlock.children = [firstParagraph];
						this.currentEntry.blocks.push(firstBlock);
						this.currentEntry.textOnly = undefined;
						this.makeNewBlock = true;
					}
					else
						this.parsingState = ListParsingState.whitespace;

				}
			}
			else if (this.contentParsingState === ContentParsingState.blocks) {
				if (this.cursor.currentChar === "\n") {
					this.parsingState = ListParsingState.whitespace;
					if (this.isNextLineNewEntry()) {
						this.isNewLine = true;
						this.parsingState = ListParsingState.start;
						this.contentParsingState = ContentParsingState.text;
					}
					else if (this.isNextLineNestedList()) {
						this.isNewLine = true;
						this.contentParsingState = ContentParsingState.sublist;
					}
				}
				if (this.makeNewBlock) {
					const newBlock = this.possibleChildren[0].make(this.cursor) as P_Block;
					if (newBlock.canStart())
						this.currentEntry.blocks.push(newBlock);
					else
						return AfterParseResult.ended;
				}
				const parseResult = this.currentEntry.blocks[this.currentEntry.blocks.length - 1].parseChar();
				this.makeNewBlock = parseResult === AfterParseResult.ended;
			}
			else if (this.contentParsingState === ContentParsingState.sublist) {
				if (!this.currentEntry.sublist)
					this.currentEntry.sublist = new P_List(this.cursor);
				if (this.isNewLine) {
					if (this.isNextLineStillIndented())
						this.cursor.nextLine = this.nextLineBackup.slice(this.listType.indentation);
					this.isNewLine = false;
				}
				if (this.cursor.currentChar === "\n") {
					this.isNewLine = true;
					if (this.isNextLineStillIndented()) {
						this.parsingState = ListParsingState.whitespace;
					}
					else if (this.isNextLineNewEntry()) {
						this.parsingState = ListParsingState.start;
						this.contentParsingState = ContentParsingState.text;
					}
				}
				this.currentEntry.sublist.parseChar();
				return AfterParseResult.consumed;
			}
		}

		return AfterParseResult.consumed;
	}

	toHtmlString(): string {
		let out = `<${this.listType.tagName}>`;
		for (const entry of this.entries) {
			out += `<li>`;
			if (entry.textOnly)
				out += entry.textOnly.toHtmlString().replace(/^\s+|\s+$/, "");
			for (const block of entry.blocks)
				out += block.toHtmlString();
			if (entry.sublist)
				out += entry.sublist.toHtmlString();
			out += `</li>`;
		}
		out += `</${this.listType.tagName}>`;
		return out;
	}

	private isNextLineNewEntry(): boolean {
		return this.nextLineBackup ? this.listType.startRegex.test(this.nextLineBackup) : false;
	}

	private isNextLineNestedList(): boolean {
		let line = this.nextLineBackup;
		if (!line || !line.startsWith(" ".repeat(this.listType.indentation)))
			return false;
		line = line.slice(this.listType.indentation);
		for (const listType of P_List.listTypes) {
			if (listType.initialStartRegex.test(line))
				return true;
		}
		return this.currentEntry.sublist?.isNextLineList();

	}

	private isNextLineStillIndented(): boolean {
		return this.nextLineBackup ? this.nextLineBackup.startsWith(" ".repeat(this.listType.indentation)) : false;
	}

	private isNextLineList(): boolean {
		return this.isNextLineNewEntry() || this.isNextLineStillIndented() && this.currentEntry?.sublist?.isNextLineList();
	}
}
