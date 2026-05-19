import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';

const inputDir = new URL('../static/projects', import.meta.url).pathname;
const outputDir = new URL('../static/img/projects', import.meta.url).pathname;

mkdirSync(outputDir, { recursive: true });

const files = readdirSync(inputDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));

for (const file of files) {
	const input = join(inputDir, file);
	const name = basename(file, extname(file));
	const output = join(outputDir, `${name}.webp`);
	await sharp(input)
		.resize(800, 800, { fit: 'cover', position: 'attention' })
		.webp({ quality: 85 })
		.toFile(output);
	console.log(`✓ ${file} → ${name}.webp`);
}

console.log('Done.');
