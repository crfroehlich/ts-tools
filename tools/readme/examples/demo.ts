import Readme from '../src/readme';
import { promisify } from 'util';
import { writeFile } from 'fs';

const arg = process.argv[2] || '';
const infile = './example.md';
const outfile = './example.out.md';
const readme = new Readme(infile);

async function update() {
  
  await readme.parse();
  readme.setSection('License', 'NS8 Proprietary 1.0');
  await promisify(writeFile)(outfile, readme.export());

}

async function toc() {

  await readme.parse();
  const toc = readme.toc();
  readme.setSection('Demo Library', toc);
  await promisify(writeFile)(outfile, readme.export());

}

async function query() {

  await readme.parse();
  const toc = readme.toc();
  readme.getSection('info');
  readme.getSection('info');

}

const funcs: Map<string, any> = new Map([
  ['update', update],
  ['toc',    toc],
]);


if (arg === '-l') {
  console.log('update\ntoc\nquery');
  process.exit(0);
}

if (funcs.has(arg)) {
  funcs.get(arg)();
} else {
  console.log(`No ${arg} function.`);
}
