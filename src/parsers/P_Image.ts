import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {P_BasicText} from "./P_BasicText.js";
import {escapeAttr} from "../utils.js";

enum ManualLinkParsingState {
	start, content, separation, link, title, end
}
const imgUrlRegex = /^!\[.*]\(((?:https:\/\/|\/)(?:[^)]|\\\)|\\\()+)\)/s;
const imgIdRegex = /^!\[.*]\(([\w\|]+)(?: "[^"]*"| '[^']*')?\)/s;

const allowedDomains = [
	"redd.it",
	"reddit.com",
	"redditmedia.com",
];

/**  */
export class P_Image extends P_Parser {
	id: string = "img";
	canChildrenRepeat: boolean = false;
	possibleChildren: ParserType[] = [ParserType.from(P_BasicText)];

	private manualLinkParsingState: ManualLinkParsingState = ManualLinkParsingState.start;
	private titleSurrounding = "";
	private url: string = "";
	private alt: string = "";
	private title: string = "";

	canStart(): boolean {
		if (!(/^(|\W)$/.test(this.cursor.previousChar) || this.cursor.isNewNode))
			return false;
		if (this.cursor.previousChar === "\\")
			return false;
		if (imgUrlRegex.test(this.cursor.remainingText)) {
			const match = imgUrlRegex.exec(this.cursor.remainingText)!;
			const urlStr = match[1];
			if (urlStr.startsWith("/"))
				return true;
			const url = new URL(urlStr);
			const host = url.hostname;
			const domain = host.split(".").slice(-2).join(".");
			return allowedDomains.includes(domain);
		}
		if (this.cursor.remainingText.startsWith("![")) {
			if (this.cursor.redditData.media_metadata && Object.keys(this.cursor.redditData.media_metadata).length > 0) {
				if (imgIdRegex.test(this.cursor.remainingText)) {
					const match = imgIdRegex.exec(this.cursor.remainingText)!;
					if (match[1] in this.cursor.redditData.media_metadata)
						return true;
				}
			}
		}
		return false;
	}

	parseChar(): AfterParseResult {
		if (this.manualLinkParsingState === ManualLinkParsingState.start) {
			if (this.cursor.currentChar === "[")
				this.manualLinkParsingState = ManualLinkParsingState.content;
		}
		else if (this.manualLinkParsingState === ManualLinkParsingState.content) {
			if (this.cursor.currentChar === "]" && this.cursor.previousChar !== "\\")
				this.manualLinkParsingState = ManualLinkParsingState.separation
			else
				this.alt += this.cursor.currentChar;
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
			if (this.title === "" && this.titleSurrounding === "" && /["']/.test(this.cursor.currentChar)) {
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

	toHtmlString(): string {
		let url = "";
		if (this.cursor.redditData.media_metadata && this.url in this.cursor.redditData.media_metadata) {
			const media = this.cursor.redditData.media_metadata[this.url];
			url = media.s.u ?? "";
		}
		if (!url)
			url = this.url;
		console.log(this.titleSurrounding);
		console.log(this.title);
		return `<img src="${escapeAttr(encodeURI(url))}"${this.title ? ` title="${escapeAttr(this.title)}"` : ""}${this.alt ? ` alt="${escapeAttr(this.alt)}"` : ""}>`;
	}
}
