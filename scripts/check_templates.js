const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      searchDir(full);
    } else if (/\.(ts|tsx)$/.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, i) => {
        if (/https?:\/\//i.test(l) && !/unsplash|googleusercontent|w3\.org|localhost/i.test(l)) {
          console.log(`${full}:${i+1} -> ${l.trim()}`);
        }
      });
    }
  }
}

searchDir('src/app/templates');
