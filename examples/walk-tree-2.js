var nodegit = require("nodegit"),
    path = require("path");

// A `tree` in git is typically a representation of the filesystem at
// a revision. A tree has a set of entries, each entry being either a
// tree (directory), or a file.

nodegit.Repository.open(path.resolve(__dirname, "../.git"))
  .then(function(repo) {
    return repo.getTree("8d1370f076cbf0f2c4364549b4d9a8d38a9c2cc0"); 
  })
  .then(function(tree) {
    // `walk()` returns an event.
    console.log("tree.path():"+ tree.path());
    console.log("tree.entryCount:" + tree.entryCount());
    var walker = tree.walk(false);
    walker.on("entry", function(entry) {
         console.log(entry.path());
         console.log(entry.oid());
    });

    // Don't forget to call `start()`!
    walker.start();
  })
  .done();
