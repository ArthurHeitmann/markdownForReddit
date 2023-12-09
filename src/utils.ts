
/** escapes all html characters, except for "&" because they are used literally in markdown */
export function escapeHtml(string: string): string {
	// copied & modified from escape-html npm package

	const str = '' + string;
	const match = /["'<>]|&(?!([a-zA-Z\d]+|#\d+|#x[a-fA-F\d]+);)/.exec(str);

	if (!match) {
		return str;
	}

	let escape;
	let html = '';
	let index: number;
	let lastIndex = 0;

	for (index = match.index; index < str.length; index++) {
		switch (str.charCodeAt(index)) {
			case 34: // "
				escape = '&quot;';
				break;
			case 38: // &
				escape = '&amp;';
				break;
			case 39: // '
				escape = '&#39;';
				break;
			case 60: // <
				escape = '&lt;';
				break;
			case 62: // >
				escape = '&gt;';
				break;
			default:
				continue;
		}

		if (lastIndex !== index) {
			html += str.substring(lastIndex, index);
		}

		lastIndex = index + 1;
		html += escape;
	}

	return lastIndex !== index
		? html + str.substring(lastIndex, index)
		: html;
}

export function escapeAttr(string: string): string {
	return string
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

/** escapes all regex special characters */
export function escapeRegex(strToEscape: string): string {
	return strToEscape.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export interface AdditionalRedditData {
	media_metadata?: RedditMediaData;
	mediaDisplayPolicy?: MediaDisplayPolicy;
}

export interface RedditMediaData {
	[key: string]: {
		e: string,
		id: string,
		m: string,
		p?: RedditMediaDataEntry[],
		s: RedditMediaDataEntry,
		status: string,
		t?: string,
	}
}

export interface RedditMediaDataEntry {
	x: number,
	y: number,
	u?: string,
	gif?: string,
	mp4?: string,
}

export enum MediaDisplayPolicy {
	link,
	emoteOnly,
	imageOrGif,
}
