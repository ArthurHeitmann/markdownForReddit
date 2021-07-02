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
})