var nodegit = require("nodegit");
var path = require("path");

nodegit.Repository.open(path.resolve(__dirname, "../gitRepos/notes/.git"))
  .then(function(repo) {
    return repo.fetch("origin", {
      callbacks: {
        credentials: function(url, userName) {
          return nodegit.Cred.sshKeyFromAgent(userName);
        }
      }
    });
  }).done(function() {
    console.log("It worked!");
  });
