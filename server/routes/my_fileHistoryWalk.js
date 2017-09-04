const path = require("path");
const gitReposDir = "/workspaces/mynodegit/gitRepos";
const notesDir=gitReposDir + '/notes';
const Git=require("nodegit");


//===
function mytreefind(tree,linux_fname, res, cb){

	var walker = tree.walk(true);// true to ignore tree, only blob 
	walker.on("entry", entry => {
			if(linux_fname == entry.path() ) {
			console.log("got " + linux_fname);
			//rm listeners before cb()
			walker.removeAllListeners();
			//getBlob() has to be done before walker.free()
			entry.getBlob().then(blob =>
				{
				tree.free(); //cannot stop tree walking ?
				cb({"content": blob.toString()}, res);
				walker.free();
				});

			}else {
			//console.log(entry.path());
			}
			});
	walker.start();

}



//===
function core(cmt, linux_fname, res){
	const cb= function(o,res){ console.log("cb done: "); console.log(JSON.stringify(o));};

	cmt.getTree().then(function(tree) {
			mytreefind(tree, linux_fname, res,cb);
			}).catch(err=> console.log(err));

}

var dirName="cat33", fname="f33.txt";
var linux_fname=path.join(dirName, fname);//.replace(/\\/g, "/");
var repoDirName=path.resolve(notesDir);
console.log("noteDir resolved to " + repoDirName);
console.log("dirName/fname resolved to " + linux_fname);

// This code walks the history of the master branch and prints results
// that look very similar to calling `git log` from the command line
var i=0;
Git.Repository.open(repoDirName)
	.then(function(repo) {
			return repo.getMasterCommit();
			})
.then(function(firstCommitOnMaster){
		// History returns an event.
		var history = firstCommitOnMaster.history(Git.Revwalk.SORT.Time);

		// History emits "commit" event for each commit in the branch's history
		history.on("commit", function(commit) {
			i++;
			console.log(i);
			//	console.log("commit " + commit.sha());
			//	console.log("Author:", commit.author().name() +
			//			" <" + commit.author().email() + ">");
			//	console.log("Date:", commit.date());
			//	console.log("\n    " + commit.message());

			core(commit, linux_fname, null);
			});


		history.on("end", function() {history.removeAllListeners();});
		// Don't forget to call `start()`!
		history.start();
})
.done();
