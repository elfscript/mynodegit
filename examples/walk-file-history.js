const gitServerDir = "/workspaces/mynodegit/gitRepos";
const notesDir=gitServerDir + '/notes';
const path=require('path');

var dirName=path.resolve(notesDir);
console.log("noteDir resolved to " + dirName);


var Git = require("nodegit"),
    historyFile = "cat0/cat0_f1.txt", //"/workspaces/mynodegit/examples/file_history.json",
    walker,
    historyCommits = [],
    commit,
    repo;
//===============


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
    console.log("no commit found!!");
    return;
  }

  lastSha = historyCommits[historyCommits.length - 1].commit.sha();

  walker = repo.createRevWalk();
  walker.push(lastSha);
  walker.sorting(Git.Revwalk.SORT.TIME);

  return walker.fileHistoryWalk(historyFile, 100)
    .then(compileHistory);
}



//=================
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

    return walker.fileHistoryWalk(historyFile, 100).then(compileHistory)
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


