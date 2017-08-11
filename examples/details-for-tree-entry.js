var nodegit = require("nodegit");
var path = require("path");

/**
 * This shows how to get details from a tree entry or a blob
**/

nodegit.Repository.open(path.resolve(__dirname, "../.git"))
  .then(function(repo) {
    return repo.getTree("2dac7eb8b265b4867545d54ea57f8fea94929bdd")
    .then(function(tree) {
      var treeEntry = tree.entryByIndex(0);
        console.log("treeEntry path: " + treeEntry.path());
        console.log("treeEntry oid: " + treeEntry.oid());
        var fpath=path.join(tree.path(), treeEntry.path());
       console.log("tree.path(): " + tree.path());
       console.log("fpath: " + fpath);
       console.log("tree.owner().path(): " + tree.owner().path());
       console.log("tree to treeEntry"); 

      // Tree entry doesn't have any data associated with the actual entry
      // To get that we need to get the index entry that this points to
      return tree.owner().index().then(function(index) { 
       console.log(index.path());
       console.log(index.entryCount());
        var indexEntry = index.getByPath("examples/walk-tree.js");
        if(indexEntry){
        // With the index entry we can now view the details for the tree entry
        console.log("Entry path: " + indexEntry.path);//());
        console.log("Entry time in seconds: " + indexEntry.mtime.seconds());
        console.log("Entry oid: " + indexEntry.id.toString());
        console.log("Entry size: " + indexEntry.fileSize);
       } else { console.log("null indexEntry"); }
          });
    }).catch(err => console.log(err));

  }).catch(err => console.log(err))
  .done(function() {
    console.log("Done!");
  });
