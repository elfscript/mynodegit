var util=require("util");
var path=require("path");

var args = process.argv.slice(2);
var tgt="test";

if(args.length >=1){
	tgt= args[0];
}

var dest=tgt;
if(args.length >=2){
	dest= args[1];
}

console.log(util.format("to clone from %s under nodegit repo to local %s",tgt,dest));



var NodeGit = require("nodegit");
// Using the `clone` method from the `Git.Clone` module, bring down the NodeGit
// test repository from GitHub.
var cloneURL = "https://github.com/nodegit/nodegit";
//console.log("cloneURL=" + cloneURL);

// Ensure that the `tmp` directory is local to this file and not the CWD.
var tmpPath = path.join(__dirname, "tmp");
var destPath = path.join(__dirname, dest);
// Simple object to store clone options.
var cloneOptions = {};

// This is a required callback for OS X machines.  There is a known issue
// with libgit2 being able to verify certificates from GitHub.
cloneOptions.fetchOpts = {
	callbacks: {
		certificateCheck: function() { return 1; }
	}
};

// Invoke the clone operation and store the returned Promise.
try{
	var cloneRepository = NodeGit.Clone(cloneURL, tmpPath, cloneOptions);

	// If the repository already exists, the clone above will fail.  You can simply
	// open the repository in this case to continue execution.
	var errorAndAttemptOpen = function(err) {
		console.log("errorAndAttemptOpen()" +err);
		return NodeGit.Repository.open(tmpPath);
	};

	var myutil=require(path.join(__dirname,"myutil.js"));
	// Once the repository has been cloned or opened, you can work with a returned
	cloneRepository.catch(errorAndAttemptOpen)
		.then(function(repository) {
			// Access any repository methods here.
			console.log("Is the repository bare? %s", Boolean(repository.isBare()));
			console.log(util.format("to move from tmp/%s to ./%s", dest,dest));
			myutil.mv(path.join(tmpPath,dest), destPath)
			.then(function(){myutil.rmdir(tmpPath)})
			.catch(function(err){console.log(err);});

		});
}catch(e){
	console.log(e);
}

