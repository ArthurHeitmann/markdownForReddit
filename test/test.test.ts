import {parseMarkdown} from "../src/main.js";
import {expect} from 'chai';

function testMarkdown(markdown, expectedHtml) {
	expect(parseMarkdown(markdown)).to.equal(expectedHtml);
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
				testMarkdown("```\ncode\n```", `<pre><code>code</code></pre>`)
			});

			it("Multi Line", () => {
				testMarkdown("```\ncode l1 \n\nl2\n```", `<pre><code>code l1 \n\nl2</code></pre>`)
			});

			it("Multiple Blocks", () => {
				testMarkdown("```\nblock 1\n```\n\n```\nblock 2\n```", `<pre><code>block 1</code></pre><pre><code>block 2</code></pre>`)
			});

			it("Nested backticks", () => {
				testMarkdown("````\n```\nnested\n```\n````", `<pre><code>\`\`\`\nnested\n\`\`\`</code></pre>`)
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
});
