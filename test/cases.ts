export const cases: string[][] = [
	['', ''],
	["Hello world\n\nparagraph 2", `<p>Hello world</p><p>paragraph 2</p>`],
	["Some `code`", `<p>Some <code>code</code></p>`],
	["Normal^superscript", `<p>Normal<sup>superscript</sup></p>`],
	["Escape\\^superscript", `<p>Escape^superscript</p>`],
	["~~normal strikethrough~~", `<p><del>normal strikethrough</del></p>`],
	["\\~~escaped strikethrough~~", `<p>~~escaped strikethrough~~</p>`],
	['<tests>', `<p>&lt;test&gt;</p>`],
	['words_with_underscores', `<p>words_with_underscores</p>`],
	['words*with*asterisks', `<p>words<em>with</em>asterisks</p>`],
	['~tests', `<p>~test</p>`],
	// ["# Heading 1", `<h1>Heading 1</h1>`],
	// ["## Heading 2", `<h2>Heading 2</h2>`],
	// from https://github.com/gamefreak/snuownd/blob/master/test.js
	// 'http://www.reddit.com':
	//     '<p><a href="http://www.reddit.com">http://www.reddit.com</a></p>\n',
	//
	// 'http://www.reddit.com/a\x00b':
	//     '<p><a href="http://www.reddit.com/ab">http://www.reddit.com/ab</a></p>\n',
	//
	// '[foo](http://en.wikipedia.org/wiki/Link_(film\\))':
	//     '<p><a href="http://en.wikipedia.org/wiki/Link_(film)">foo</a></p>\n',
	//
	// '(http://tsfr.org)':
	//     '<p>(<a href="http://tsfr.org">http://tsfr.org</a>)</p>\n',
	//
	// '[A link with a /r/subreddit in it](/lol)':
	//     '<p><a href="/lol">A link with a /r/subreddit in it</a></p>\n',
	//
	// '[A link with a http://www.url.com in it](/lol)':
	//     '<p><a href="/lol">A link with a http://www.url.com in it</a></p>\n',
	//
	// '[Empty Link]()':
	//     '<p>[Empty Link]()</p>\n',
	//
	// 'http://en.wikipedia.org/wiki/café_racer':
	//     '<p><a href="http://en.wikipedia.org/wiki/caf%C3%A9_racer">http://en.wikipedia.org/wiki/café_racer</a></p>\n',
	//
	// '#####################################################hi':
	//     '<h6>###############################################hi</h6>\n',
	//
	// '[foo](http://bar\nbar)':
	//     '<p><a href="http://bar%0Abar">foo</a></p>\n',
	//
	// '/r/tests':
	//     '<p><a href="/r/tests">/r/tests</a></p>\n',
	//
	// 'Words words /r/tests words':
	//     '<p>Words words <a href="/r/tests">/r/tests</a> words</p>\n',
	//
	// '/r/':
	//     '<p>/r/</p>\n',
	//
	// 'escaped \\/r/tests':
	//     '<p>escaped /r/tests</p>\n',
	//
	// 'ampersands http://www.google.com?test&blah':
	//     '<p>ampersands <a href="http://www.google.com?test&amp;blah">http://www.google.com?test&amp;blah</a></p>\n',
	//
	// '[_regular_ link with nesting](/tests)':
	//     '<p><a href="/tests"><em>regular</em> link with nesting</a></p>\n',
	//
	// ' www.a.co?with&tests':
	//     '<p><a href="http://www.a.co?with&amp;test">www.a.co?with&amp;tests</a></p>\n',
	//
	//
	// 'anywhere\x03, you':
	//     '<p>anywhere, you</p>\n',
	//
	// '[Test](//tests)':
	//     '<p><a href="//tests">Test</a></p>\n',
	//
	// '[Test](//#tests)':
	//     '<p><a href="//#tests">Test</a></p>\n',
	//
	// '[Test](#tests)':
	//     '<p><a href="#tests">Test</a></p>\n',
	//
	// '[Test](git://github.com)':
	//     '<p><a href="git://github.com">Test</a></p>\n',
	//
	// '[Speculation](//?)':
	//     '<p><a href="//?">Speculation</a></p>\n',
	//
	// '/r/sr_with_underscores':
	//     '<p><a href="/r/sr_with_underscores">/r/sr_with_underscores</a></p>\n',
	//
	// '[Test](///#tests)':
	//     '<p><a href="///#tests">Test</a></p>\n',
	//
	// '/r/multireddit+tests+yay':
	//     '<p><a href="/r/multireddit+tests+yay">/r/multireddit+tests+yay</a></p>\n',
	//
	// '/u/tests':
	//     '<p><a href="/u/tests">/u/tests</a></p>\n',
	//
	// 'blah \\':
	//     '<p>blah \\</p>\n',
	//
	// '/r/whatever: fork':
	//     '<p><a href="/r/whatever">/r/whatever</a>: fork</p>\n',
	//
	// '/r/t:timereddit':
	//     '<p><a href="/r/t:timereddit">/r/t:timereddit</a></p>\n',
	//
	// '/r/reddit.com':
	//     '<p><a href="/r/reddit.com">/r/reddit.com</a></p>\n',
	//
	// '/r/not.cool':
	//     '<p><a href="/r/not">/r/not</a>.cool</p>\n',
	//
	// '/r/very+clever+multireddit+reddit.com+t:fork+yay':
	//     '<p><a href="/r/very+clever+multireddit+reddit.com+t:fork+yay">/r/very+clever+multireddit+reddit.com+t:fork+yay</a></p>\n',
	//
	// '/r/t:heatdeathoftheuniverse':
	//     '<p><a href="/r/t:heatdeathoftheuniverse">/r/t:heatdeathoftheuniverse</a></p>\n',
	//
	// '&thetasym;': '<p>&thetasym;</p>\n',
	// '&foobar;': '<p>&amp;foobar;</p>\n',
	// '&nbsp': '<p>&amp;nbsp</p>\n',
	// '&#foobar;': '<p>&amp;#foobar;</p>\n',
	// '&#xfoobar;': '<p>&amp;#xfoobar;</p>\n',
	// '&#9999999999;': '<p>&amp;#9999999999;</p>\n',
	// '&#99;': '<p>&#99;</p>\n',
	// '&#X7E;': '<p>&#X7E;</p>\n',
	// '&frac12;': '<p>&frac12;</p>\n',
	// '&': '<p>&amp;</p>\n',
	// '&;': '<p>&amp;;</p>\n',
	// '&#;': '<p>&amp;#;</p>\n',
	// '&#x;': '<p>&amp;#x;</p>\n',
];