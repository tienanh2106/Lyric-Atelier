#!/usr/bin/env node
/**
 * Post-process Orval generated files to fix:
 * 1. React Query v5 compatibility (remove query.queryKey mutation)
 * 2. ESLint no-redeclare errors (rename const enums)
 */

const fs = require('fs');
const path = require('path');

const ENDPOINTS_DIR = path.join(__dirname, '../src/services/endpoints');
const MODELS_DIR = path.join(__dirname, '../src/services/models');

// Recursively find all .ts files
function findTsFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (item.endsWith('.ts')) {
      files.push(fullPath);
    }
  });

  return files;
}

const endpointFiles = findTsFiles(ENDPOINTS_DIR);
const modelFiles = findTsFiles(MODELS_DIR);
const allFiles = [...endpointFiles, ...modelFiles];

let fixedCount = 0;

allFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;

  // Fix 1: Remove query.queryKey mutation (React Query v5 compatibility)
  content = content.replace(/^\s*query\.queryKey\s*=\s*queryOptions\.queryKey\s*;?\s*$/gm, '');

  // Fix 2: Rename const enum objects to avoid no-redeclare
  // Pattern: export type Name = (typeof Name)[keyof typeof Name];
  //          // eslint-disable-next-line @typescript-eslint/no-redeclare
  //          export const Name = { ... } as const;
  // Solution: Rename const to NameEnum and update type reference

  // Step 1: Find all type declarations that reference themselves
  const typePattern = /export type (\w+) = \(typeof \1\)\[keyof typeof \1\];/g;
  let match;
  const typesToRename = new Set();

  while ((match = typePattern.exec(content)) !== null) {
    typesToRename.add(match[1]);
  }

  // Step 2: For each type that needs renaming, update both type and const
  typesToRename.forEach((typeName) => {
    // Update the type declaration to reference NameEnum instead of Name
    const typeRegex = new RegExp(
      `export type ${typeName} = \\(typeof ${typeName}\\)\\[keyof typeof ${typeName}\\];`,
      'g'
    );
    content = content.replace(
      typeRegex,
      `export type ${typeName} = (typeof ${typeName}Enum)[keyof typeof ${typeName}Enum];`
    );

    // Update the const declaration (with or without eslint-disable comment)
    const constRegex = new RegExp(
      `(\\/\\/ eslint-disable-next-line[^\n]*\n)?export const ${typeName} =`,
      'g'
    );
    content = content.replace(
      constRegex,
      `export const ${typeName}Enum =`
    );
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    fixedCount++;
    console.log(`✓ Fixed: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\n✅ Fixed ${fixedCount} file(s)`);
