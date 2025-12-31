/**
 * Cross-platform script to build frontend and copy to app/dist/static
 */
import { execSync } from 'child_process';
import { cpSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = join(__dirname, '..');
const frontendDir = join(appDir, '..', 'frontend');
const frontendDist = join(frontendDir, 'dist');
const targetDir = join(appDir, 'dist', 'static');

console.log('🔨 Building frontend...');

// Build the frontend
try {
  execSync('npm run build', { 
    cwd: frontendDir, 
    stdio: 'inherit',
    shell: true 
  });
} catch (error) {
  console.error('❌ Failed to build frontend');
  process.exit(1);
}

console.log('📁 Copying frontend build to app/dist/static...');

// Remove existing static directory
if (existsSync(targetDir)) {
  rmSync(targetDir, { recursive: true, force: true });
}

// Create target directory
mkdirSync(targetDir, { recursive: true });

// Copy frontend dist to target
cpSync(frontendDist, targetDir, { recursive: true });

console.log('✅ Frontend copied successfully!');

