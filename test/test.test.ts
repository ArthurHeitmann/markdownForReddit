import {parseMarkdown} from "../src/main.js";
import {expect} from 'chai';

const debug = true;

function testMarkdown(markdown, expectedHtml) {
	const generatedHtml = parseMarkdown(markdown);
	if (debug)
		console.log(`markdown: \n${markdown}\n  expected:  ${expectedHtml}\n  generated: ${generatedHtml}\n\n`)
	expect(generatedHtml).to.equal(expectedHtml);
}

describe("Markdown to HTML", () => {
	describe("Paragraph", () => {
		it("nothing", () => {
			testMarkdown("", ``)
		})

		it("1 simple paragraph", () => {
			testMarkdown("Hello world", `<p>Hello world</p>`)
		})

		it("2 simple paragraphs", () => {
			testMarkdown("Hello world\n\nparagraph 2", `<p>Hello world</p><p>paragraph 2</p>`)
		})

		it("paragraph cleanup", () => {
			testMarkdown("  \n\t\nHello world \n\nparagraph 2 \n\n \t", `<p>Hello world</p><p>paragraph 2</p>`)
		});
	})

	describe("Inline Code", () => {
		it("just inline code", () => {
			testMarkdown("`code`", `<p><code>code</code></p>`)
		});

		it("repeating inline code", () => {
			testMarkdown("`code 1` `code 2` `code 3` ", `<p><code>code 1</code> <code>code 2</code> <code>code 3</code></p>`)
		});

		it("Multiple backtick code", () => {
			testMarkdown("``` `co`d ``e` ```", `<p><code>\`co\`d \`\`e\`</code></p>`)
		});

		it("Escaped inline code", () => {
			testMarkdown("\\`code`", `<p>\`code\`</p>`)
		});
	});

	describe("Superscript", () => {
		it("just super", () => {
			testMarkdown("^sup", `<p><sup>sup</sup></p>`)
		});

		it("Mid word super", () => {
			testMarkdown("xy^21", `<p>xy<sup>21</sup></p>`)
		});

		it("super with parentheses", () => {
			testMarkdown("^(sup1 sup2 sup3)", `<p><sup>sup1 sup2 sup3</sup></p>`)
		});

		it("repeating super", () => {
			testMarkdown("^sup ^(sup2 sup3)", `<p><sup>sup</sup> <sup>sup2 sup3</sup></p>`)
		});

		it("escaped super", () => {
			testMarkdown("\\^sup", `<p>^sup</p>`)
		});
	});

	describe("Simple Styles", () => {
		const styles = [
			{ chars: "*", tag: "em" },
			{ chars: "_", tag: "em" },
			{ chars: "**", tag: "strong" },
			{ chars: "__", tag: "strong" },
			{ chars: "~~", tag: "del" },
		]

		for (const style of styles) {
			describe(`${style.chars} --> <${style.tag}>`, () => {
				it(`Basic ${style.chars} --> <${style.tag}>`, () => {
					testMarkdown(`${style.chars}text${style.chars}`, `<p><${style.tag}>text</${style.tag}></p>`)
				});

				it(`Repeating ${style.chars} --> <${style.tag}>`, () => {
					testMarkdown(`${style.chars}text 1${style.chars} ${style.chars}text 2${style.chars}`, `<p><${style.tag}>text 1</${style.tag}> <${style.tag}>text 2</${style.tag}></p>`)
				});

				it(`Escaped ${style.chars}`, () => {
					testMarkdown(`${style.chars.replace(/(.)/g, "\\$1")}text 1${style.chars}`, `<p>${style.chars}text 1${style.chars}</p>`)
				});
				it(`Only ${style.chars} at tart --> no <${style.tag}>`, () => {
					testMarkdown(`${style.chars}text`, `<p>${style.chars}text</p>`)
				});

				if (style.chars === "_") {
					it("_ in text --> no <em>", () => {
						testMarkdown("word1_xyz_word2", `<p>word1_xyz_word2</p>`)
					});

					it("first _ in test, last _ at end --> <em>", () => {
						testMarkdown("word1_xyz_word2_", `<p>word1<em>xyz_word2</em></p>`)
					});
				}
			});
		}

		describe(`>! --> <span class="md-spoiler-text">`, () => {
			it(`Basic >! --> <span class="md-spoiler-text">`, () => {
				testMarkdown(`>!text!<`, `<p><span class="md-spoiler-text">text</span></p>`)
			});

			it(`Repeating >! --> <span class="md-spoiler-text">`, () => {
				testMarkdown(`>!text 1!< >!text 2!<`, `<p><span class="md-spoiler-text">text 1</span> <span class="md-spoiler-text">text 2</span></p>`)
			});

			it(`Escaped >!`, () => {
				testMarkdown(`\\>!text 1!<`, `<p>&gt;!text 1!&lt;</p>`)
			});
		});

		it("¯\\_(ツ)_/¯", () => {
			testMarkdown("¯\\\\\\_(ツ)_/¯", `<p>¯\\_(ツ)_/¯</p>`)
			testMarkdown("¯\\_(ツ)_/¯", `<p>¯_(ツ)_/¯</p>`)
		});
	});

	describe("Multiline Code", () => {
		describe("Leading Spaces", () => {
			it("Single line", () => {
				testMarkdown("    code", `<pre><code>code</code></pre>`)
			});

			it("Multi line", () => {
				testMarkdown("    code1\n    code2\n    \n    code3\n    code4\n", `<pre><code>code1\ncode2\n\ncode3\ncode4</code></pre>`)
			});

			it("No formatting in code", () => {
				testMarkdown("    code *i* >!sp!<  \n        ^sup", `<pre><code>code *i* &gt;!sp!&lt;  \n    ^sup</code></pre>`)
			});

			it("Multiple blocks", () => {
				testMarkdown("    b1 l1\n        b1 l2\n\n    b2 l1\n        b2 l2", `<pre><code>b1 l1\n    b1 l2</code></pre><pre><code>b2 l1\n    b2 l2</code></pre>`)
			});
		});

		describe("Fenced", () => {
			it("Single Line", () => {
				testMarkdown("```\ncode\n```", `<code>code</code>`)
			});

			it("Multi Line", () => {
				testMarkdown("```\ncode l1 \n\nl2\n```", `<code>code l1 \n\nl2</code>`)
			});

			it("Multiple Blocks", () => {
				testMarkdown("```\nblock 1\n```\n\n```\nblock 2\n```", `<code>block 1</code><code>block 2</code>`)
			});

			it("Nested backticks", () => {
				testMarkdown("````\n```\nnested\n```\n````", `<code>\`\`\`\nnested\n\`\`\`</code>`)
			});
		});
	});

	it("Horizontal Line", () => {
		for (const ch of ["-", "*", "_"]) {
			testMarkdown(ch.repeat(3), `<hr>`)
			testMarkdown(ch.repeat(5), `<hr>`)
			testMarkdown("\\" + ch.repeat(3), `<p>${ch.repeat(3)}</p>`)
		}
	});

	describe("Quote", () => {
		it("Simple Quote", () => {
			testMarkdown("> quote", `<blockquote><p>quote</p></blockquote>`)
		});

		it("Multiline Quote", () => {
			testMarkdown("> quote  \n> l2", `<blockquote><p>quote<br>\nl2</p></blockquote>`)
		});

		it("Multi-paragraph Quote", () => {
			testMarkdown("> quote\n> \n> b2", `<blockquote><p>quote</p><p>b2</p></blockquote>`)
		});

		it("Nested Quotes", () => {
			testMarkdown("> > l2", `<blockquote><blockquote><p>l2</p></blockquote></blockquote>`)
		});

		it("Nested Multiline Quotes", () => {
			testMarkdown("> > l1  \n> > l2", `<blockquote><blockquote><p>l1<br>\nl2</p></blockquote></blockquote>`)
		});

		it("Styled Quotes", () => {
			testMarkdown("\n> *i* `` code` `` > __b__\n> \n>     code \n> \n> ---\n",
				`<blockquote><p><em>i</em> <code>code\`</code> &gt; <strong>b</strong></p><pre><code>code </code></pre><hr></blockquote>`)
		});

		it("Escaped Quotes", () => {
			testMarkdown("\\> not a quote", `<p>&gt; not a quote</p>`)
		});
	});

	describe("Headings", () => {
		for (let i = 0; i < 6; ++i) {
			it(`Simple h1`, () => {
				testMarkdown(`${"#".repeat(i + 1)} Heading`, `<h${i+1}>Heading</h${i+1}>`);
			});
		}

		it("Styled Heading", () => {
			testMarkdown("## *i* ^(sup 2) # testing `code`", `<h2><em>i</em> <sup>sup 2</sup> # testing <code>code</code></h2>`)
		});
	});

	describe("html", () => {
		it("HTML entities", () => {
			testMarkdown("&nbsp;", `<p>&nbsp;</p>`)
			testMarkdown("&#x2003;", `<p>&#x2003;</p>`)
		});

		it("Escaped html chars", () => {
			testMarkdown("<script></script>", `<p>&lt;script&gt;&lt;/script&gt;</p>`)
		});
	});

	describe("Lists", () => {
		describe("Unordered", () => {
			it("simple", () => {
				testMarkdown("- list", `<ul><li>list</li></ul>`)
			});

			it("multi-entry", () => {
				testMarkdown("" +
					"- l1\n" +
					"- l2",
					`<ul><li>l1</li><li>l2</li></ul>`)
			});

			it("multi-line", () => {
				testMarkdown("" +
					"- l1\n" +
					"  l2",
					`<ul><li>l1 l2</li></ul>`)
				testMarkdown("" +
					"- l1  \n" +
					"  l2",
					`<ul><li>l1<br>\nl2</li></ul>`)
			});

			it("styled", () => {
				testMarkdown("- *i* ^sup", `<ul><li><em>i</em> <sup>sup</sup></li></ul>`)
			});

			it("escaped", () => {
				testMarkdown("\\- not a list", `<p>- not a list</p>`)
			});

			it("nested", () => {
				testMarkdown("" +
					"- number 1\n" +
					"  - n 1.1\n" +
					"  - n 1.2\n" +
					"- number 2\n" +
					"  - n 2.1\n" +
					"  - n 2.2\n" +
					"    - 2.2.1\n" +
					"    - 2.2.2 *i*",
					"<ul>" +
						"<li>number 1<ul>" +
							"<li>n 1.1</li>" +
							"<li>n 1.2</li>" +
						"</ul></li>" +
						"<li>number 2<ul>" +
							"<li>n 2.1</li>" +
							"<li>n 2.2<ul>" +
								"<li>2.2.1</li>" +
								"<li>2.2.2 <em>i</em></li>" +
							"</ul></li>" +
						"</ul></li>" +
					"</ul>")
			});

			it("blocks", () => {

			});
		});
	});

	describe("Links", () => {
		describe("reddit internal links", () => {
			it("subreddit", () => {
				testMarkdown("r/all", `<p><a href="/r/all">r/all</a></p>`)
				testMarkdown("/r/all", `<p><a href="/r/all">/r/all</a></p>`)
				testMarkdown("r/reddit.com", `<p><a href="/r/reddit.com">r/reddit.com</a></p>`)
				testMarkdown("/r/some_sub", `<p><a href="/r/some_sub">/r/some_sub</a></p>`)
			});

			it("user", () => {
				testMarkdown("u/all", `<p><a href="/u/all">u/all</a></p>`)
				testMarkdown("/u/all", `<p><a href="/u/all">/u/all</a></p>`)
				testMarkdown("user/all", `<p><a href="/user/all">user/all</a></p>`)
				testMarkdown("/user/all", `<p><a href="/user/all">/user/all</a></p>`)
			});

			it("combinations", () => {
				testMarkdown("r/pics+announcements+test+reddit.com", `<p><a href="/r/pics+announcements+test+reddit.com">r/pics+announcements+test+reddit.com</a></p>`)
				testMarkdown("u/all/m/multi", `<p><a href="/u/all/m/multi">u/all/m/multi</a></p>`)
				testMarkdown("(r/all)", `<p>(<a href="/r/all">r/all</a>)</p>`)
			});

			it("non links", () => {
				testMarkdown("r/all.nope", `<p><a href="/r/all">r/all</a>.nope</p>`)
				testMarkdown("r/", `<p>r/</p>`)
				testMarkdown("x/sub", `<p>x/sub</p>`)
				testMarkdown("\\/r/all", `<p>/r/all</p>`)
			});
		});

		describe("Schema Links", () => {
			it("schemas", () => {
				testMarkdown("https://reddit.com", `<p><a href="https://reddit.com">https://reddit.com</a></p>`)
				testMarkdown("https://reddit.com/r/all/top?t=all&count=10", `<p><a href="https://reddit.com/r/all/top?t=all&count=10">https://reddit.com/r/all/top?t=all&count=10</a></p>`)
			});

			it("different environments", () => {
				testMarkdown("text https://reddit.com text2", `<p>text <a href="https://reddit.com">https://reddit.com</a> text2</p>`)
				testMarkdown("(https://reddit.com)", `<p>(<a href="https://reddit.com">https://reddit.com</a>)</p>`)
			});

			it("non links", () => {
				testMarkdown("texthttps://reddit.com", `<p>texthttps://reddit.com</p>`)
				testMarkdown("bla://x.com", `<p>bla://x.com</p>`)
			});
		});
	});

	describe("Tables", () => {
		it("Header Only Table", () => {
			testMarkdown("" +
				"| Header 1 | Header 2 | Header 3 |\n" +
				"|----------|----------|----------|\n",
				`<table><thead><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr></thead><tbody></tbody></table>`)
		});

		it("Simple Table", () => {
			testMarkdown("" +
				"| Header 1 | Header 2 | Header 3 |\n" +
				"|----------|----------|----------|\n" +
				"| row 1    | r/all    | *2*      |\n" +
				"| - row 2  | `val 2`  | ^3       |",
				`<table><thead><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr></thead><tbody><tr><td>row 1</td><td><a href="/r/all">r/all</a></td><td><em>2</em></td></tr><tr><td>- row 2</td><td><code>val 2</code></td><td><sup>3</sup></td></tr></tbody></table>`)
		});

		it("Aligned table", () => {
			testMarkdown("" +
				"| Header 1 | Header 2 | Header 3 |\n" +
				"|:---------|---------:|:--------:|\n" +
				"| row 1    | r/all    | *2*      |\n" +
				"| - row 2  | `val 2`  | ^3       |",
				`<table><thead><tr><th align="left">Header 1</th><th align="right">Header 2</th><th align="center">Header 3</th></tr></thead><tbody><tr><td align="left">row 1</td><td align="right"><a href="/r/all">r/all</a></td><td align="center"><em>2</em></td></tr><tr><td align="left">- row 2</td><td align="right"><code>val 2</code></td><td align="center"><sup>3</sup></td></tr></tbody></table>`)
			
		});
		it("Simple Table (minimal)", () => {
			testMarkdown("" +
				"| Header 1 | Header 2 | Header 3 |\n" +
				"|-|-|-|\n" +
				"| row 1 | r/all | *2* |\n" +
				"| - row 2 | `val 2` | ^3 |", 
				`<table><thead><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr></thead><tbody><tr><td>row 1</td><td><a href="/r/all">r/all</a></td><td><em>2</em></td></tr><tr><td>- row 2</td><td><code>val 2</code></td><td><sup>3</sup></td></tr></tbody></table>`)
		});

		it("Aligned table (minimal)", () => {
			testMarkdown("" +
				"| Header 1 | Header 2 | Header 3 |\n" +
				"|:-|-:|:-:|\n" +
				"| row 1 | r/all | *2* |\n" +
				"| - row 2 | `val 2` | ^3 |",
				`<table><thead><tr><th align="left">Header 1</th><th align="right">Header 2</th><th align="center">Header 3</th></tr></thead><tbody><tr><td align="left">row 1</td><td align="right"><a href="/r/all">r/all</a></td><td align="center"><em>2</em></td></tr><tr><td align="left">- row 2</td><td align="right"><code>val 2</code></td><td align="center"><sup>3</sup></td></tr></tbody></table>`)
		});
	});
});
