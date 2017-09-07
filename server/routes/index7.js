const path=require("path");
const Git = require("nodegit");
const {router, gitReposDir, notesDir}=require("./router_core");
const myutil=require("./myutil.js");

var _hitArr=[];
var _hitCount=0;
var _cmtArr=[];

function mytreefind(tree,linux_fname, cmt, cb){
	var fname=path.normalize(linux_fname);
	var walker = tree.walk(true);// true to ignore tree, only blob
	walker.on("entry", entry => {
			if( fname == entry.path() ) {
			//entry.path() gives windows separator on win7
			console.log("got " + fname);
			console.log("fileMode " +  entry.filemode());
			//rm listeners before cb()
			walker.removeAllListeners();
			//getBlob() has to be done before walker.free()
			entry.getBlob().then(blob =>
				{
				tree.free(); //cannot stop tree walking ?
				_hitCount++;
				cb({"hit_count": _hitCount, "content": blob.toString(), "fname": linux_fname, "blobid":blob.id(),"cmtid":cmt.id(), "cmt_time":cmt.timeMs()}, null);
				walker.free(); //has to be placed after cb()
				});

			}else {
			//console.log(entry.path());
			}
			});
	walker.start();

}


var _promises=[];

//===
function core(cmt, linux_fname, cmt_count){
	const cb= function(o,xxx){ 
		console.log("cb done: " + _hitCount); 
		//var jstr=JSON.stringify(o); 
		o.cmt_count=cmt_count;
		_hitArr.push(o);
	};

	_promises.push( cmt.getTree().then(function(tree) {
				mytreefind(tree, linux_fname, cmt,cb);
				}).catch(err=> console.log(err)) );

}




//=== 
// {"hit_count": _hitCount, "content": blob.toString(), "fname": linux_fname, "blobid":blob.id().toString(),"cmtid":cmt.id(), "cmt_time":cmt.timeMs()}


function compare_asc(a,b){
	return a.cmt_time - b.cmt_time;
}

function compare_desc(a,b){
	return b.cmt_time - a.cmt_time;
}



function uniqBy(a, key) { 
	var seen = {}; 
	return a.filter(function(item) { 
			var k = key(item); 
			return seen.hasOwnProperty(k) ? false : (seen[k] = true); 
			});
}


function sortUniq(arr){
	console.log("sortUniq(arr) ...");

	arr=	arr.sort(compare_asc);
	return uniqBy(arr, o=>{return o.blobid}).map((item,i,arr)=>{item.cmt_time_fmt=myutil.timestamp2DateString(item.cmt_time); return item;}); 
}



var _cmt_dels=[];


function detect(repo, arr,j){
	console.log("detect(arr,j) ..." + j);

	if(j >= (arr.length -1)) return;

	var item=arr[j];
	console.log("j=" + j);
	var cmt= _cmtArr[item.cmt_count];

	var bConti=false;
	var parentid=0;
	var prevItem=arr[j+1];
	for(var i=0; i< cmt.parentcount(); i++){
		if(prevItem.cmtid.equal( cmt.parentId(i))){ 
			bConti= true; break;
		}
	}

	if(bConti) {
		return detect(repo,arr, j+1);
	} else {
		var k=prevItem.cmt_count-1;
		var candCmt=_cmtArr[k];
		do{
			console.log("k= " + k);
			console.log("candCmt.id(),  " + candCmt.id());
			console.log("prevItem.cmtid, "+ prevItem.cmtid);
			bConti=false; 
			for(var i=0; i< cmt.parentcount(); i++){
				console.log("candCmt.parentId(i), " + candCmt.parentId(i) );
				if(prevItem.cmtid.equal( candCmt.parentId(i)) ){ 
					bConti= true; break;
				}
			}
			if(bConti) { _cmt_dels.push({"cmt": candCmt, "cmt_count":k}); break;} 
			else { //shd not happen
				k--; candCmt=_cmtArr[k];
			}
		}while(k>0);	
		return detect(repo, arr, j+1); 
	}


}


function sort2detect(repo, arr){
	console.log("sort2detect() ...");
	arr=arr.sort(compare_desc);
	var j=0;
	return	detect(repo, arr,j);
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
		_hitArr=null;
		_hitArr=[];
		_cmtArr=[];
		_hitCount=0;
		_promises=[];

		var fname =decodeURIComponent( req.params.fname);

		var repoDirName=path.resolve(notesDir);
		console.log("noteDir resolved to " + repoDirName);

		//linux_fname=path.join(dirName, fname).replace(/\\/g, "/");
		var linux_fname= path.normalize(fname);

		console.log("fname resolved to " + linux_fname);

		// This code walks the history of the master branch and prints results
		// that look very similar to calling `git log` from the command line
		var i=0;
		var _repo;
		Git.Repository.open(repoDirName)
			.then(function(repo) {
					_repo=repo;
					return repo.getMasterCommit();
					})
		.then(function(firstCommitOnMaster){
				// History returns an event.
				var history = firstCommitOnMaster.history(Git.Revwalk.SORT.Time);

				// History emits "commit" event for each commit in the branch's history
				history.on("commit", function(commit) {
					console.log(i);
					console.log("commit " + commit.sha());
					//      console.log("Author:", commit.author().name() +
					//                      " <" + commit.author().email() + ">");
					//      console.log("Date:", commit.date());
					//      console.log("\n    " + commit.message());
					_cmtArr.push(commit);
					core(commit, linux_fname, i++);
					});


				history.on("end", function() {
					history.removeAllListeners();
					Promise.all(_promises).then(function(){  
						var sortedArr=sortUniq(_hitArr);
						sort2detect(_repo, sortedArr, 0);
						for(var i=0; i< _cmt_dels.length; i++){
						sortedArr.push(
							{"cmt_count":_cmt_dels[i].cmt_count, "hit_count": -1, "content": null, "fname": linux_fname, "blobid":"", "cmtid":_cmt_dels[i].cmt.id(), "cmt_time":_cmt_dels[i].cmt.timeMs(), "cmt_time_fmt": myutil.timestamp2DateString(_cmt_dels[i].cmt.timeMs()) });
						console.log("_cmt_dels[i], i=" + i);				
						}
						res.json( sortedArr.sort(compare_desc).map(item =>{ return myutil.propToString(item)}) );

						});	
					});
				// Don't forget to call `start()`!
				history.start();
		})
		.done();
});

//=========

module.exports = router;
