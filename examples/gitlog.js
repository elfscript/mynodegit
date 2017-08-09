const gitServerDir = "/workspaces/mynodegit/gitRepos";
const notesDir=gitServerDir + '/notes';
const path=require('path');

var dirName=path.resolve(notesDir);
console.log("noteDir resolved to " + dirName);


Git=require("nodegit");

// Open the repository directory.
Git.Repository.open(dirName)
	// Open the master branch.
	.then(function(repo) {
			return repo.getMasterCommit();
			})
// Display information about commits on master.
.then(function(firstCommitOnMaster) {
		// Create a new history event emitter.
		var history = firstCommitOnMaster.history();

		// Create a counter to only show up to 9 entries.
		var count = 0;

		// Listen for commit events from the history.
		history.on("commit", function(commit) {
			// Disregard commits past 9.
			if (++count >= 9) {
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

