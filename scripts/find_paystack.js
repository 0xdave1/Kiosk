const fs = require('fs');
const path = require('path');

function searchAll(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (f === 'node_modules' || f === '.next' || f === '.git' || f === 'find_paystack.js') continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      searchAll(full);
    } else if (/\.(ts|tsx)$/.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (/href=.*(checkout|pay|plan)/i.test(line) || /window\.location/i.test(line)) {
          console.log(`${full}:${i+1} -> ${line.trim()}`);
        }
      });
    }
  }
}

searchAll('src');
