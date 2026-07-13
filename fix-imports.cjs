const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Fix useAuth imports
  if (content.includes('@/_core/hooks/useAuth')) {
    content = content.replace(/@\/_core\/hooks\/useAuth/g, '@/contexts/AuthContext');
    changed = true;
  }

  // Fix portal components which are now in the same directory
  if (content.includes('@/components/portal/')) {
    content = content.replace(/@\/components\/portal\/([A-Za-z0-9_]+)/g, './$1');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed imports in', file);
  }
}
