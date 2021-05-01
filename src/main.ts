import escape from "escape-html";

class MarkdownForReddit {
    markdown
}

export default function markdownToHtml(md: string): string {
    const escaped = escape(md);
    return escaped;
}
