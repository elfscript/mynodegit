const path=require("path");
const Git = require("nodegit");
const {router, gitReposDir, notesDir}=require("./router_core");
var _hisArr=[];
var _hiscount=0;

function mytreefind(tree,linux_fname, cmt, cb){
        var fname=path.normalize(linux_fname);
	var walker = tree.walk(true);// true to ignore tree, only blob
	walker.on("entry", entry => {
			if( fname == entry.path() ) {
                        //entry.path() gives windows separator on win7
			console.log("got " + fname);
			//rm listeners before cb()
			walker.removeAllListeners();
			//getBlob() has to be done before walker.free()
			entry.getBlob().then(blob =>
				{
				tree.free(); //cannot stop tree walking ?
				_hiscount++;
				cb({"id": _hiscount, "content": blob.toString(), "fname": linux_fname, "blobid":blob.id().toString(),"cmtid":cmt.id().toString()}, null);
				walker.free();
				});

			}else {
			//console.log(entry.path());
			}
			});
	walker.start();

}



//===
function core(cmt, linux_fname,xxx){
	const cb= function(o,xxx){ 
		console.log("cb done: " + _hiscount); 
		var jstr=JSON.stringify(o); 
		_hisArr.push(jstr);
	};

	cmt.getTree().then(function(tree) {
			mytreefind(tree, linux_fname, cmt,cb);
			}).catch(err=> console.log(err));

}





/**
 * @swagger
 * /api/gitlog/{fname}:
 *   get:
 *     tags:
 *       - git log 
 *     description: Returns history of a file  
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: fname 
 *         description: fname(how to include subfolder? urlencode the path separator ?) 
 *         in: path
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: file history 
 *         schema:
 *          type: object 
 */
router.get('/gitlog/:fname', (req, res) => {
		_hisArr=null;
		_hisArr=[];
		_hiscount=0;
		var fname =decodeURIComponent( req.params.fname);

		var repoDirName=path.resolve(notesDir);
		console.log("noteDir resolved to " + repoDirName);

		//linux_fname=path.join(dirName, fname).replace(/\\/g, "/");
		var linux_fname= path.normalize(fname);

		console.log("fname resolved to " + linux_fname);

		// This code walks the history of the master branch and prints results
		// that look very similar to calling `git log` from the command line
		var i=0;
		Git.Repository.open(repoDirName)
		.then(function(repo) {
			return repo.getMasterCommit();
			})
		.then(function(firstCommitOnMaster){
				// History returns an event.
				var history = firstCommitOnMaster.history(Git.Revwalk.SORT.Time);

				// History emits "commit" event for each commit in the branch's history
				history.on("commit", function(commit) {
					i++;
					console.log(i);
					console.log("commit " + commit.sha());
					//      console.log("Author:", commit.author().name() +
					//                      " <" + commit.author().email() + ">");
					//      console.log("Date:", commit.date());
					//      console.log("\n    " + commit.message());

					core(commit, linux_fname, res);
					});


				history.on("end", function() {
					history.removeAllListeners();
					res.json(_hisArr);
					});
				// Don't forget to call `start()`!
				history.start();
		})
		.done();
});

//=========

module.exports = router;
