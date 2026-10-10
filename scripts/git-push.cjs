const { spawnSync } = require("child_process");
const gitPath = "C:\\Program Files\\Git\\cmd\\git.exe";

console.log("Pushing to GitHub remote...");
const res = spawnSync(gitPath, ["push", "origin", "main"], {
	cwd: "c:\\Users\\JEREMIAH VICTOR\\Desktop\\kiosk\\kiosk",
	encoding: "utf-8",
});

if (res.stdout) console.log(res.stdout);
if (res.stderr) console.error(res.stderr);
console.log("Push result:", res.status);
