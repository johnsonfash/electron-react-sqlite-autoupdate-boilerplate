// scripts/sync-update-feed.ts
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { execSync } from 'child_process';

const bucketName = process.env.B2_BUCKET_NAME!;
const backendUrl = process.env.BACKEND_URL!;
const authToken = process.env.UPLOAD_AUTH_TOKEN!;
const releaseDir = path.resolve(__dirname, '../release');
const latestYmlPath = path.join(releaseDir, 'latest.yml');
const packageJsonPath = path.resolve(__dirname, '../package.json');

function getFileInfo(fileName: string): { exists: boolean; size?: number; sha1?: string } {
  try {
    const output = execSync(`b2 get-file-info ${bucketName} "${fileName}"`, { stdio: 'pipe' }).toString();
    const info = JSON.parse(output);
    return { exists: true, size: parseInt(info.contentLength), sha1: info.contentSha1 };
  } catch {
    return { exists: false };
  }
}

function sha1(filePath: string): string {
  return execSync(`sha1sum "${filePath}" | awk '{print $1}'`).toString().trim();
}

async function main() {
  // Load local version
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const localVersion = pkg.version;
  console.log(`Local version: ${localVersion}`);

  // Fetch backend version
  let backendVersion: string | null = null;
  try {
    const { data } = await axios.get(`${backendUrl}/latest-version`);
    backendVersion = data.version;
    console.log(`Backend version: ${backendVersion}`);
  } catch {
    console.warn('Could not fetch backend version. Proceeding with upload...');
  }

  // Exit early if backend version matches
  if (backendVersion && backendVersion === localVersion) {
    console.log('Version unchanged. Skipping upload & backend sync.');
    process.exit(0);
  }

  // Ensure latest.yml exists
  if (!fs.existsSync(latestYmlPath)) {
    console.error('latest.yml not found. Did you run a build?');
    process.exit(1);
  }

  // Upload changed files only
  console.log('Checking & uploading release files to B2...');
  const files = fs.readdirSync(releaseDir);
  for (const file of files) {
    const filePath = path.join(releaseDir, file);
    const localSha = sha1(filePath);
    const remoteInfo = getFileInfo(file);

    if (remoteInfo.exists && remoteInfo.sha1 === localSha) {
      console.log(`Skipping ${file} (no change).`);
      continue;
    }

    console.log(`Uploading ${file}...`);
    execSync(
      `b2 upload-file ${bucketName} "${filePath}" "${file}" --replace`,
      { stdio: 'inherit' }
    );
  }

  // Rewrite latest.yml with public B2 URLs
  const latestYml = fs.readFileSync(latestYmlPath, 'utf-8');
  const publicBaseUrl = `https://f000.backblazeb2.com/file/${bucketName}`;
  const updatedYml = latestYml.replace(/path: .+/g, (line) => {
    const file = line.split('path: ')[1];
    return `path: ${publicBaseUrl}/${file}`;
  });
  fs.writeFileSync(latestYmlPath, updatedYml);
  console.log('latest.yml updated with public B2 URLs');

  // Notify backend
  console.log('Notifying backend of new release...');
  const formData = new FormData();
  formData.append('file', fs.createReadStream(latestYmlPath));
  formData.append('version', localVersion);

  await axios.post(`${backendUrl}/upload-latest-yml`, formData, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      ...formData.getHeaders(),
    },
  });

  console.log('Backend notified of new release.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
