var Git = require("nodegit");
const gitReposDir = "/workspaces/mynodegit/gitRepos";
const notesDir=gitReposDir + '/notes';
const path= require('path');

var _repo, _walker, _itercount;

var dirName=path.resolve(notesDir);
console.log("noteDir resolved to " + dirName);

Git.Repository.open(dirName) // Open the master branch.
  .then(function(repo) {
    _repo=repo;
    return repo.getMasterCommit();
  })
  .then(function(firstCommitOnMaster) {
    var total_count = firstCommitOnMaster.parentcount();
    console.log("total_count= " + total_count);
   }); 



/*
 _walker.free();


 walker = _repo.createRevWalk();
 walker.push(lastSha);
 walker.sorting(Git.Revwalk.SORT.TIME);
 _walker=walker;
 return walker.fileHistoryWalk(historyFile, )
   .then(compileHistory);
*/
