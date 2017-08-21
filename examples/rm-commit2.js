var nodegit = require("nodegit"),
    path = require("path"),
    fileName = "filea.txt";

/**
 * This example deletes a certain file `newfile.txt`,
 * removes it from the git index and commits it to head. Similar to a
 * `git rm newfile.txt` followed by a `git commit`. Use add-and-commit.js
 * to create the file first.
**/

var _repository;
var _index;
var _oid;

//open a git repo
nodegit.Repository.open(path.resolve(__dirname, "../gitRepos/notes/.git"))
  .then(function(repo) {
    _repository = repo;
    return repo.refreshIndex();
  })
  .then(function(index){
    _index = index;
  })
  .then(function() {
    //remove the file from the index...
    return _index.removeByPath(fileName);
  })
  .then(function() {
    return _index.write();
  })
  .then(function() {
    return _index.writeTree();
  })
  .then(function(oid) {
    _oid = oid;
    return _repository.getHeadCommit();
  })
  .then(function(parent) {
    var t= Math.floor(new Date() / 1000);
    var author = nodegit.Signature.create("Elf Deng",
      "elfscript@gmail.com", t, 0);
    var committer = author; 

    return _repository.createCommit("HEAD", author, committer,
      "message", _oid, [parent]);
  })
  .then(function(commitId) {
    // the file is removed from the git repo, use fs.unlink now to remove it
    // from the filesystem.
    console.log("New Commit:", commitId.allocfmt());
  })
  .done();
