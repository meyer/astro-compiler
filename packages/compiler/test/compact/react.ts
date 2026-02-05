import { transform } from '@astrojs/compiler';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

async function reactMinify(input: string) {
	const code = (await transform(input, { compact: 'react' })).code;
	return code.replace('${$$maybeRenderHead($$result)}', '');
}

test('react: basic text', async () => {
	assert.match(
		await reactMinify('<div>Hello {value}!</div>'),
		'$$render`<div>Hello ${value}!</div>`'
	);
});

test('react: single line preserves spaces', async () => {
	assert.match(
		await reactMinify('<div>  Hello  </div>'),
		'$$render`<div>  Hello  </div>`'
	);
});

test('react: multiline strips indentation', async () => {
	assert.match(
		await reactMinify('<div>\n  Hello\n  World\n</div>'),
		'$$render`<div>Hello World</div>`'
	);
});

test('react: tabs become spaces', async () => {
	assert.match(
		await reactMinify('<div>\tHello\t</div>'),
		'$$render`<div> Hello </div>`'
	);
});

test('react: whitespace-only multiline is removed', async () => {
	assert.match(
		await reactMinify('<div>\n  <p>text</p>\n</div>'),
		'$$render`<div><p>text</p></div>`'
	);
});

test('react: preservation', async () => {
	assert.match(await reactMinify('<pre>  Hello\n  World  </pre>'), '$$render`<pre>  Hello\n  World  </pre>`');
	assert.match(await reactMinify('<textarea>  Hello\n  World  </textarea>'), '$$render`<textarea>  Hello\n  World  </textarea>`');
});

test('react: expressions', async () => {
	assert.match(
		await reactMinify('<div>hello {x}</div>'),
		'$$render`<div>hello ${x}</div>`'
	);
	assert.match(
		await reactMinify('<div>{x} hello</div>'),
		'$$render`<div>${x} hello</div>`'
	);
});

test('react: expression trimming', async () => {
	assert.match(
		await reactMinify('<div>{\n  expression\n}</div>'),
		'$$render`<div>${expression}</div>`'
	);
});

test('react: typical component children', async () => {
	assert.match(
		await reactMinify('<div>\n  <h1>Title</h1>\n  <p>Content</p>\n</div>'),
		'$$render`<div><h1>Title</h1><p>Content</p></div>`'
	);
});

test.run();
