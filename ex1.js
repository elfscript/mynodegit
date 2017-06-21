var nodegit = require('nodegit'),
        path = require('path');

var url = "https://github.com/elfscript/desktop-app.git",
    local = "./leanote-desktop",
        cloneOpts = {};

nodegit.Clone(url, local, cloneOpts).then(function (repo) {
	    console.log("Cloned " + path.basename(url) + " to " + repo.workdir());
}).catch(function (err) {
	    console.log(err);
});
