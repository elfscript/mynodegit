var nodegit = require("nodegit"),
    path = require("path");

// A `tree` in git is typically a representation of the filesystem at
// a revision. A tree has a set of entries, each entry being either a
// tree (directory), or a file.

nodegit.Repository.open(path.resolve(__dirname, "../.git"))
  .then(function(repo) {
    return repo.getMasterCommit();
  })
  .then(function(firstCommitOnMaster) {
      return firstCommitOnMaster.getTree();
  })
  .then(function(tree) {
    // `walk()` returns an event.
    console.log("tree.path():"+ tree.path());
    var walker = tree.walk(false);
    walker.on("entry", function(entry) {
      if(entry.isTree()) {
         console.log(entry.path());
         console.log(entry.oid());
       }
    });

    // Don't forget to call `start()`!
    walker.start();
  })
  .done();
