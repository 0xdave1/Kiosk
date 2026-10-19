const fs = require('fs');
const path = require('path');

function searchAllFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'find_paystack.js' || entry.name === 'deep_search.js') continue;
    if (entry.isDirectory()) {
      if (entry.name !== '.git') {
        searchAllFiles(full);
      }
    } else {
      try {
        const content = fs.readFileSync(full, 'utf8');
        if (/paystack/i.test(content)) {
          console.log('PAYSTACK FOUND IN:', full);
          content.split('\n').forEach((line, idx) => {
            if (/paystack/i.test(line)) {
              console.log(`  Line ${idx + 1}: ${line.trim()}`);
            }
          });
        }
      } catch (e) {
        // binary or unreadable
      }
    }
  }
}

searchAllFiles('.');
