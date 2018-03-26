var nodegit = require("nodegit"),
    path = require("path");

// A `tree` in git is typically a representation of the filesystem at
// a revision. A tree has a set of entries, each entry being either a
// tree (directory), or a file.
//nodegit.Tree.prototype.mypath=
var trees=[];
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
    console.log("typeof tree:" + typeof tree);
    var walker = tree.walk(false);
    walker.on("entry", function(entry) {
      if(entry.isTree()) {
         console.log(entry.path());
         entry.getTree().then(subtree => {subtree.mypath=entry.path(); trees.push(subtree); });
         console.log(entry.oid());
       }
    });

    walker.on("end", finalEntries => {
       trees.forEach( t=>console.log(t.mypath) ); 
    });
    // Don't forget to call `start()`!
    walker.start();
  })
  .done();
