import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import fs from 'node:fs';
const css = fs.readFileSync('app/globals.css', 'utf8');
const res = await postcss([tailwind()]).process(css, { from: 'app/globals.css' });
const out = res.css;
fs.writeFileSync('/tmp/clea-compiled.css', out);
console.log('BYTES', out.length);
for (const needle of ['96svh', '82svh', 'backdrop-filter: none', 'pointer: coarse']) {
  console.log(needle, '=>', out.includes(needle));
}
