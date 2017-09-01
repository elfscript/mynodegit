const gitServerDir = "/workspaces/mynodegit/gitRepos";
const notesDir=gitServerDir + '/notes';
const path=require('path');

var dirName=path.resolve(notesDir);
console.log("noteDir resolved to " + dirName);


var Git = require("nodegit"),
    historyFile = "cat33/f33.txt",
    walker,
    historyCommits = [],
    commit,
    repo;
//===============
var _walker;
var _itercount=10;
const _maxcount = 1000;

//=== recursive call self - compileHistory ?

function compileHistory(resultingArrayOfCommits) {
	var lastSha;
	if (historyCommits.length > 0) {
		lastSha = historyCommits[historyCommits.length - 1].commit.sha();
		if (
				resultingArrayOfCommits.length == 1 &&
				resultingArrayOfCommits[0].commit.sha() == lastSha
		   ) {
			return;
		}
	}

	resultingArrayOfCommits.forEach(function(entry) {
			historyCommits.push(entry);
			});

	if(historyCommits.length <=0 ) {
		console.log("no commit matching the file found yet!!");
		_itercount = _itercount*2;
		_itercount= (_itercount > _maxcount ? _maxcount: _itercount); 
                console.log("_itercount increased to " + _itercount);

		return _walker.fileHistoryWalk(historyFile, _itercount).then(compileHistory);
	} else {
		lastSha = historyCommits[historyCommits.length - 1].commit.sha();
		_walker.free();

		walker = repo.createRevWalk();
		walker.push(lastSha);
		walker.sorting(Git.Revwalk.SORT.TIME);
		_walker=walker;
		return walker.fileHistoryWalk(historyFile, _itercount)
			.then(compileHistory);
	}
}



//================
Git.Repository.open(dirName)
	.then(function(r) {
			repo = r;
			return repo.getMasterCommit();
			})
.then(function(firstCommitOnMaster){
		// History returns an event.
		walker = repo.createRevWalk();
		walker.push(firstCommitOnMaster.sha());
		walker.sorting(Git.Revwalk.SORT.Time);
		console.log("firstCommitOnMaster.sha():" + firstCommitOnMaster.sha() );
		_walker=walker;
		return walker.fileHistoryWalk(historyFile, _itercount).then(compileHistory);
		})
.then(function() {
		console.log("walker.fileHistoryWalk() finished ? or not ?");
		historyCommits.forEach(function(entry) {
			commit = entry.commit;
			//console.log("entry.path(), " + entry.path());
			console.log("commit " + commit.sha());
			console.log("Author:", commit.author().name() +
				" <" + commit.author().email() + ">");
			console.log("Date:", commit.date());
			console.log("\n    " + commit.message());
			});
		})
.catch( err=> {console.log(err);} )
.done(()=>{console.log("done");}) ;


