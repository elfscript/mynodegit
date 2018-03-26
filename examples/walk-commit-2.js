var args = process.argv.slice(2);
var sortKind=args[0];

var nodegit = require("nodegit"),
    path = require("path");

// This code walks the history of the master branch and prints results
// that look very similar to calling `git log` from the command line
var i=0 ;
var _cmtArr=[];

function printCmt(i, commit){
	console.log(i);
	console.log("commit " + commit.sha());
	console.log("Author:", commit.author().name() +
			" <" + commit.author().email() + ">");
	console.log("Date:", commit.date());
	console.log("\n    " + commit.message());
}
//=======================

function is_a_parentId(pid , cmt){
        //cmt.parents() return array of oids
        //xxx if( cmt.parents().indexOf(pid) >= 0) return true;
        var arr=cmt.parents();
        for(var i=0; i< arr.length; i++){
                if(pid.toString() == arr[i].toString()) return true;
        }
        return false;
}


function is_a_parentCmt(pcmt, cmt){
    return is_a_parentId(pcmt.id(), cmt);
}

//=== assume sort by topological/descending
function detectParentCmt(i, cmt){
   var bconti= is_a_parentCmt(  cmt,  _cmtArr[i-1]);
 
}

//===============

console.log("=== correct spelling ======");
console.log(nodegit.Revwalk.SORT.NONE);
console.log(nodegit.Revwalk.SORT.TIME);
console.log(nodegit.Revwalk.SORT.REVERSE);
console.log(nodegit.Revwalk.SORT.TOPOLOGICAL);
console.log("=============================");




nodegit.Repository.open(path.resolve(__dirname, "../gitRepos/notes/.git"))
.then(function(repo) {
		return repo.getMasterCommit();
		})
.then(function(firstCommitOnMaster){
		// History returns an event.
		var history = firstCommitOnMaster.history(sortKind);

		// History emits "commit" event for each commit in the branch's history
		history.on("commit", function(commit) {
			_cmtArr.push(commit);
			printCmt(i,commit);
                        i++;
			});

		history.on("end", function(){
		      //for(var j=0; j< _cmtArr.length; j++){
			//printCmt(j, _cmtArr[j]);
		      //}


			});    

		// Don't forget to call `start()`!
		history.start();
		})
.done();
