import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {P_BasicText} from "./P_BasicText.js";
import {escapeHtml} from "../utils.js";

enum LinkParsingState {
	notStarted, reddit, schema, manual
}
enum ManualLinkParsingState {
	start, content, separation, link, title, end
}
const redditRegex = /^\/?(r|u|user)\/[^\/]+/;
const schemaRegex = /^(http:\/\/|https:\/\/|ftp:\/\/|mailto:|git:\/\/|steam:\/\/|irc:\/\/|news:\/\/|mumble:\/\/|ssh:\/\/|ircs:\/\/|ts3server:\/\/).+/;
const manualRegex = /^\[.+]\((http:\/\/|https:\/\/|ftp:\/\/|mailto:|git:\/\/|steam:\/\/|irc:\/\/|news:\/\/|mumble:\/\/|ssh:\/\/|ircs:\/\/|ts3server:\/\/|\/|#)([^)]|\\\)|\\\()+\)/s;

export class P_Link extends P_Parser {
	id: string = "link";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [ParserType.from(P_BasicText)];

	private parsingState: LinkParsingState = LinkParsingState.notStarted;
	private manualLinkParsingState: ManualLinkParsingState = ManualLinkParsingState.start;
	private titleSurrounding = "";
	private url: string = "";
	private altLinkText = "";
	private title: string = "";

	canStart(): boolean {
		return (
			redditRegex.test(this.cursor.remainingText) && this.cursor.previousChar !== "\\" ||
			schemaRegex.test(this.cursor.remainingText) ||
			manualRegex.test(this.cursor.remainingText)
		) && /^(|\s|\()$/.test(this.cursor.previousChar);
	}

	parseChar(): AfterParseResult {
		if (this.parsingState === LinkParsingState.notStarted) {
			if (redditRegex.test(this.cursor.remainingText))
				this.parsingState = LinkParsingState.reddit;
			else if (schemaRegex.test(this.cursor.remainingText))
				this.parsingState = LinkParsingState.schema;
			else if (manualRegex.test(this.cursor.remainingText))
				this.parsingState = LinkParsingState.manual;
		}

		if (this.parsingState === LinkParsingState.reddit) {
			if (this.url === "" && this.cursor.currentChar !== "/")
				this.url += "/";
			if (
				/[\/a-zA-Z0-9\-_+]/.test(this.cursor.currentChar) ||
				this.cursor.remainingText.startsWith(".com") && /(r\/|\+)reddit$/.test(this.cursor.previousText)
			) {
				this.url += this.cursor.currentChar;
				this.altLinkText += this.cursor.currentChar;
				if (
					!/[\/a-zA-Z0-9\-_+]/.test(this.cursor.remainingText[1])
					&& !(this.cursor.remainingText.startsWith("t.com") && /(r\/|\+)reddi$/.test(this.cursor.previousText))
				)
					return AfterParseResult.ended;
				else
					return AfterParseResult.consumed;
			}
			return AfterParseResult.ended;
		}

		if (this.parsingState === LinkParsingState.schema) {
			this.url += this.cursor.currentChar;
			this.altLinkText += this.cursor.currentChar;
			if (/[\s|)]/.test(this.cursor.remainingText[1]))
				return AfterParseResult.ended;
			else
				return AfterParseResult.consumed;
		}

		if (this.parsingState === LinkParsingState.manual) {
			if (this.manualLinkParsingState === ManualLinkParsingState.start) {
				this.manualLinkParsingState = ManualLinkParsingState.content;
			}
			else if (this.manualLinkParsingState === ManualLinkParsingState.content) {
				if (this.cursor.currentChar === "]" && this.cursor.previousChar !== "\\")
					this.manualLinkParsingState = ManualLinkParsingState.separation
				else
					super.parseChar();
			}
			else if (this.manualLinkParsingState === ManualLinkParsingState.separation) {
				this.manualLinkParsingState = ManualLinkParsingState.link;
			}
			else if (this.manualLinkParsingState === ManualLinkParsingState.link) {
				if (this.cursor.currentChar === ")" && this.cursor.previousChar !== "\\")
					return AfterParseResult.ended;
				else if (this.cursor.currentChar === " ") {
					this.manualLinkParsingState = ManualLinkParsingState.title
				}
				else
					this.url += this.cursor.currentChar;
			}
			else if (this.manualLinkParsingState === ManualLinkParsingState.title) {
				if (this.title === "" && /["']/.test(this.cursor.currentChar)) {
					this.titleSurrounding = this.cursor.currentChar;
					return AfterParseResult.consumed;
				}
				else if (this.titleSurrounding && this.cursor.currentChar === this.titleSurrounding) {
					this.manualLinkParsingState = ManualLinkParsingState.end;
				}
				else if (/[)\n]/.test(this.cursor.currentChar))
					return AfterParseResult.ended;
				else
					this.title += this.cursor.currentChar;
			}
			else if (this.manualLinkParsingState === ManualLinkParsingState.end) {
				return AfterParseResult.ended;
			}
			return AfterParseResult.consumed;
		}
	}

	toHtmlString(): string {
		return `<a href="${encodeURI(this.url)}"${this.title ? ` title="${this.title}"` : ""}>${super.toHtmlString() || escapeHtml(this.altLinkText)}</a>`;
	}
}