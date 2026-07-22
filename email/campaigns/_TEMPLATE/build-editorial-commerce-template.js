import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import editorialTemplate from '../_shared/editorial-commerce-template.js';

const { renderEditorialCommerceEmail } = editorialTemplate;
const templateDir = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(templateDir, 'editorial-commerce-data.json'), 'utf8'));
const output = path.join(templateDir, 'editorial-commerce-base.html');

fs.writeFileSync(output, renderEditorialCommerceEmail(data));
console.log(`generated ${path.relative(process.cwd(), output)}`);
