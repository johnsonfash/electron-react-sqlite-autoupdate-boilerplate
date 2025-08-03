import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const packagePath = path.resolve(__dirname, '../package.json');
const builderPath = path.resolve(__dirname, '../electron-builder.yml');
const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');

const type = process.argv[2] || 'patch';

// Bump package.json
execSync(`npm version ${type} --no-git-tag-version`);
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

// Update electron-builder.yml
let builderYml = fs.readFileSync(builderPath, 'utf-8');
builderYml = builderYml.replace(/version:\s*.+/, `version: ${pkg.version}`);
fs.writeFileSync(builderPath, builderYml);

// Update changelog
const latestCommit = execSync('git log -1 --pretty=%B').toString().trim();
fs.appendFileSync(changelogPath, `\n${new Date().toISOString().split('T')[0]} - v${pkg.version}\n- ${latestCommit}\n`);

console.log(`Version bumped to ${pkg.version}`);
