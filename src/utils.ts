import escHtml from "escape-html";

export function escapeHtml(strToEscape: string): string {
	return escHtml(strToEscape);
}

export function escapeRegex(strToEscape: string): string {
	return strToEscape.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}