const path=require("path");
const Git = require("nodegit");
const {router, gitReposDir, notesDir}=require("./router_core");
//var promisify = require("promisify-node");
//var fse = promisify(require("fs-extra"));


//==================
function mytreefind(tree,linux_fname){

	var walker = tree.walk(false);
        console.log("tree.walk(), how to change the walking order ? ");
	walker.on("entry", entry => {
			if(linux_fname == entry.path() ) {
			console.log("got " + linux_fname);
			//walker.free(); 
                        walker.removeAllListeners();	
			tree.free();
			//neither will stop the walking ???
			} else {
			console.log(entry.path());
			}
			});
	walker.start();

}


function p_onEntry(walker){ 
	return new Promise(function(resolve,reject){ 
			walker.on("entry",  resolve);
			walker.start(); }); 
}

function p_mytreefind(tree,linux_fname){
	console.log("p_mytreefind(), "+ linux_fname);
	var walker = tree.walk(false);
	return p_onEntry(walker);
}


function test1(){
	const fname="f33.txt";
	const dirName= "cat33";
	var _repo,_oid,_index, _fileContent;
	var oidStr;
	var repoDirName=path.resolve(notesDir);
	console.log("noteDir resolved to " + repoDirName);

	Git.Repository.open(repoDirName)
		.then(function(repo) {
				//return fse.readFile(path.resolve(repoDirName, dirName, fname), 'utf8');
				return repo.getMasterCommit()
				.then(function(firstCommitOnMaster) {
					return firstCommitOnMaster.getTree();
					})
				.then(function(tree) {

					var linux_fname=path.join(dirName, fname).replace("/\\/g", "/");
					return p_mytreefind(tree,linux_fname);

					}).catch(err=>console.log(err) )
				.then(function(entry) {
					if(entry.isTree())   console.log(entry.path() + " is a tree");
					else if(entry.isBlob()) console.log(entry.path() + " is a blob");
					//xxx return ...
					});
				});
}

//===
function test2(){
	const fname="f33.txt";
	const dirName= "cat33";
	var _repo,_oid,_index, _fileContent;
	var oidStr;
	var repoDirName=path.resolve(notesDir);
	console.log("noteDir resolved to " + repoDirName);
	var linux_fname=path.join(dirName, fname).replace("/\\/g", "/");

	Git.Repository.open(repoDirName)
		.then(function(repo) {
				return repo.getMasterCommit();
				}).then(function(firstCommitOnMaster) {
					return firstCommitOnMaster.getTree(); 
					}).then(function(tree) {
						console.log("tree got: " + tree.id() + ", " + tree.entryCount());
						for(var i=0; i< tree.entryCount() ; i++)
						console.log(tree.entryByIndex(i).path());
						return  tree.getEntry(linux_fname); 
						//return  tree.getEntry(tree.entryByIndex(0).path()); 
						//return tree.entryByPath("/workspaces/mynodegit/gitRepos/notes/getmtime.sh");
						}).then(treeEntry => {
							console.log("find " + treeEntry.path() + ", sha=" + treeEntry.id()); 
							}).catch(err=> console.log(err));
}




//===
function test3(){
	const fname="f33.txt";
	const dirName= "cat33";
	var _repo,_oid,_index, _fileContent;
	var oidStr;
	var repoDirName=path.resolve(notesDir);
	console.log("noteDir resolved to " + repoDirName);
	var linux_fname=path.join(dirName, fname).replace("/\\/g", "/");

	Git.Repository.open(repoDirName)
		.then(function(repo) {
				return repo.getMasterCommit();
				}).then(function(firstCommitOnMaster) {
					return firstCommitOnMaster.getTree(); 
					}).then(function(tree) {
						console.log("tree got: " + tree.id() + ", " + tree.entryCount());
						var walker = tree.walk(false);
						walker.on("entry", entry => {
							if(entry.isTree())   console.log(entry.path() + " is a tree");
							else if(entry.isBlob()) console.log(entry.path() + " is a blob");
							});
						walker.start();
						}).catch(err=> console.log(err));
}


//===
function test4(){
	const fname="test2.txt";
	const dirName= "cat22";
	var _repo,_oid,_index, _fileContent;
	var oidStr;
	var repoDirName=path.resolve(notesDir);
	console.log("noteDir resolved to " + repoDirName);
	var linux_fname=path.join(dirName, fname).replace("/\\/g", "/");

	Git.Repository.open(repoDirName)
		.then(function(repo) {
				return repo.getMasterCommit();
				}).then(function(firstCommitOnMaster) {
					return firstCommitOnMaster.getTree(); 
					}).then(function(tree) {
						mytreefind(tree, linux_fname);
						}).catch(err=> console.log(err));
}


//===
test4();
