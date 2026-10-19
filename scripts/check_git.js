const fs = require('fs');
const lines = fs.readFileSync('.git/logs/HEAD', 'utf8').trim().split('\n');
lines.slice(-15).forEach(l => console.log(l));
