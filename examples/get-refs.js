var args = process.argv.slice(2);
var reftype=args[0];
//=== nodegit.Reference.TYPE.LISTALL=3


var nodegit = require("nodegit");
var path = require("path");
var oid;
var odb;
var repo;

// **nodegit** is a javascript library for node.js that wraps libgit2, a
// pure C implementation of the Git core. It provides an asynchronous
// interface around any functions that do I/O, and a sychronous interface
// around the rest.
//
// This file is an example of using that API in a real, JS file.
//
// **libgit2** (for the most part) only implements the core plumbing
// functions, not really the higher level porcelain stuff. For a primer on
// Git Internals that you will need to know to work with Git at this level,
// check out [Chapter 9][pg] of the Pro Git book.

// Nearly, all git operations in the context of a repository.
// To open a repository,

nodegit.Repository.open(path.resolve(__dirname, "../.git"))
  .then(function(repoResult) {
    repo = repoResult;
    console.log("Opened repository.");
    // ### References

    // The [reference API][ref] allows you to list, resolve, create and update
    // references such as branches, tags and remote references (everything in
    // the .git/refs directory).

    return repo.getReferenceNames(reftype); //nodegit.Reference.TYPE.LISTALL);
  })
  .then(function(referenceNames) {
    var promises = [];

    referenceNames.forEach(function(referenceName) {
      promises.push(repo.getReference(referenceName).then(function(reference) {
        if (reference.isConcrete()) {
          console.log("Reference:", referenceName, reference.target());
        } else if (reference.isSymbolic()) {
          console.log("Reference:", referenceName, reference.symbolicTarget());
        }
      }));
    });

    return Promise.all(promises);
  })

  .done(function() {
    console.log("Done!");
  });
