import {AfterParseResult, P_Parser, ParserType} from "./P_Parser.js";
import {P_BasicText} from "./P_BasicText.js";
import {MediaDisplayPolicy, escapeAttr, tryEncodeURI} from "../utils.js";

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
		if (!this.cursor.remainingText.startsWith("!["))
			return false;
		if (!(/^(|\W)$/.test(this.cursor.previousChar) || this.cursor.isNewNode))
			return false;
		if (this.cursor.previousChar === "\\")
			return false;
		if (imgUrlRegex.test(this.cursor.remainingText))
			return true;
		if (this.cursor.redditData.media_metadata && Object.keys(this.cursor.redditData.media_metadata).length > 0) {
			if (imgIdRegex.test(this.cursor.remainingText)) {
				const match = imgIdRegex.exec(this.cursor.remainingText)!;
				if (match[1] in this.cursor.redditData.media_metadata)
					return true;
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
		let dimensions: {width: number, height: number} | undefined;
		let useLink = false;
		let mediaID: string | undefined;
		const imageDisplayPolicy = this.cursor.redditData.mediaDisplayPolicy ?? MediaDisplayPolicy.imageOrGif;
		if (this.cursor.redditData.media_metadata && this.url in this.cursor.redditData.media_metadata) {
			const media = this.cursor.redditData.media_metadata[this.url];
			url = media?.s?.u ?? media?.s?.gif ?? "";
			mediaID = this.url;
			if (media?.s?.x && media?.s?.y) {
				dimensions = {
					width: media?.s?.x,
					height: media?.s?.y,
				};
			}
			if (imageDisplayPolicy === MediaDisplayPolicy.emoteOnly && !this.url.includes("emote|"))
				useLink = true;
		}
		else {
			if (this.url.startsWith("https://")) {
				const urlObj = new URL(this.url);
				const domain = urlObj.hostname.split(".").slice(-2).join(".");
				if (!allowedDomains.includes(domain))
					useLink = true;
			}
		}
		if (imageDisplayPolicy === MediaDisplayPolicy.link)
			useLink = true;
		if (!url)
			url = this.url;
		
		let tag: string;
		const attributes: [string, string][] = [];
		let useClosingTag: boolean;
		let innerHtml = "";
		if (useLink) {
			tag = "a";
			useClosingTag = true;
			attributes.push(["href", tryEncodeURI(url)]);
			if (this.title)
				attributes.push(["title", this.title]);
			if (this.alt)
				innerHtml = escapeAttr(this.alt);
		}
		else {
			tag = "img";
			useClosingTag = false;
			attributes.push(["src", tryEncodeURI(url)]);
			if (this.title)
				attributes.push(["title", this.title]);
			if (this.alt)
				attributes.push(["alt", this.alt]);
			if (dimensions) {
				attributes.push(["width", dimensions.width.toString()]);
				attributes.push(["height", dimensions.height.toString()]);
			}
			if (mediaID)
				attributes.push(["data-media-id", mediaID]);
		}
		let html = `<${tag}`;
		for (const [key, value] of attributes) {
			html += ` ${key}="${escapeAttr(value)}"`;
		}
		html += useClosingTag ? `>${innerHtml}</${tag}>` : ">";
		return html;
	}
}
