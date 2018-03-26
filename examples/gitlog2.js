const gitServerDir = "/workspaces/mynodegit/gitRepos";
const notesDir=gitServerDir + '/notes';
const path=require('path');
var args = process.argv.slice(2);

var oidStr= "";
if(args.length>0)
	oidStr=args[0];




var dirName=path.resolve(notesDir);
console.log("noteDir resolved to " + dirName);


Git=require("nodegit");


// Open the repository directory.
Git.Repository.open(dirName)
// Open the master branch.
	.then(function(repo) {
		if(oidStr)
			return  repo.getCommit(oidStr); 
		else {
			console.log("no cmt oid given, use the masterCommit --> Head");
			return repo.getMasterCommit();
		}

	})
// Display information from a certain commit backward ?
	.then(function(cmt) {
		// Create a new history event emitter.
		var history = cmt.history(Git.Revwalk.SORT.TOPOLOGICAL);

		// Create a counter to only show up to 9 entries.
		var count = 0;

		// Listen for commit events from the history.
		history.on("commit", function(commit) {
			// Disregard commits past 9.
			if (++count >= 100) {
				return;
			}

			// Show the commit sha.
			console.log("commit " + commit.sha());

			// Store the author object.
			var author = commit.author();

			// Display author information.
			console.log("Author:\t" + author.name() + " <" + author.email() + ">");

			// Show the commit date.
			console.log("Date:\t" + commit.date());

			// Give some space and show the message.
			console.log("\n    " + commit.message());
		});

		// Start emitting events.
		history.start();
	}).then(()=> {console.log("then after history.start(), will it be done after history.end() ??")});

