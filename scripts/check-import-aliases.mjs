import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const projectRoot = process.cwd();
const sourceRoot = join(projectRoot, 'src');
const violations = [];

const visit = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      visit(fullPath);
      continue;
    }

    if (!entry.isFile() || !fullPath.endsWith('.ts')) {
      continue;
    }

    const content = readFileSync(fullPath, 'utf8');
    const patterns = [
      /(?:^|\n)\s*import\s+(?:type\s+)?(?:[^'"\n]+?\s+from\s+)?['"]([^'"]+)['"]/g,
      /import\(\s*['"]([^'"]+)['"]\s*\)/g,
    ];

    for (const pattern of patterns) {
      for (const match of content.matchAll(pattern)) {
        const specifier = match[1];

        if (!/^(\.\.\/)+/.test(specifier)) {
          continue;
        }

        violations.push({
          file: relative(projectRoot, fullPath).replaceAll('\\', '/'),
          specifier,
        });
      }
    }
  }
};

if (statSync(sourceRoot).isDirectory()) {
  visit(sourceRoot);
}

if (violations.length > 0) {
  console.error('Se detectaron imports con ../. Usa aliases o imports locales con ./ en su lugar:');
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.specifier}`);
  }
  process.exit(1);
}

console.log('Validacion de imports OK.');
