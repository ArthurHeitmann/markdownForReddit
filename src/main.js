import escape from "escape-html";
class MarkdownForReddit {
}
export default function markdownToHtml(md) {
    const escaped = escape(md);
    return escaped;
}
//# sourceMappingURL=main.js.map