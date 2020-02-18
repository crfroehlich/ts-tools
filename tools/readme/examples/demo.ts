import Readme from '../src/readme';
import { promisify } from 'util';
import { writeFile } from 'fs';
import { execSync } from 'child_process';


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

async function queryCode() {

  await readme.parse();
  const toc = readme.toc();
  console.log(readme.getSections('run the library'));

}


async function query() {

  await readme.parse();
  const toc = readme.toc();
  console.log(readme.getSections(/-header/));

}

async function blocks() {

  await readme.parse();
  console.log(readme.blocks);

}

async function indexedBlocks() {

  await readme.parse();
  console.log(readme.indexedBlocks);

}


const funcs: Map<string, any> = new Map([
  ['update', update],
  ['query',  query],
  ['query-code',  queryCode],
  ['toc',    toc],
  ['blocks',    blocks],
  ['indexed-blocks', indexedBlocks]
]);


if (arg === '-l' || arg === '') {
  const options = [...funcs.keys()].join('\n');
  console.log(options);
  process.exit(0);
}

if (funcs.has(arg)) {
  funcs.get(arg)();
} else {
  console.log(`No ${arg} function.`);
}
