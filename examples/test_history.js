var nodegit = require("nodegit"),
    path = require("path");

// This code walks the history of the master branch and prints results
// that look very similar to calling `git log` from the command line
var i=0 ;
var _cmtArr=[];
function printCmt(i, commit){
	console.log(i);
	console.log("commit " + commit.sha());
	console.log("Author:", commit.author().name() +
			" <" + commit.author().email() + ">");
	console.log("Date:", commit.date());
	console.log("\n    " + commit.message());
}



nodegit.Repository.open(path.resolve(__dirname, "../.git"))
.then(function(repo) {
		return repo.getMasterCommit();
		})
.then(function(firstCommitOnMaster){
		// History returns an event.
		var history = firstCommitOnMaster.history(nodegit.Revwalk.SORT.Time);

		// History emits "commit" event for each commit in the branch's history
		history.on("commit", function(commit) {
			i++;
			_cmtArr.push(commit);
			printCmt(i,commit);
			});

		history.on("end", function(){
			for(var i=0;i< _cmtArr.length; i++){
			printCmt(i, _cmtArr[i]);
			}

			});    

		// Don't forget to call `start()`!
		history.start();
		})
.done();
