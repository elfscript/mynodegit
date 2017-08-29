const path=require("path");
const Git = require("nodegit");
const {router, gitReposDir, notesDir}=require("./router_core");



function mytreefind(tree,linux_fname, res, cb){

	var walker = tree.walk(false);
	console.log("tree.walk(), how to change the walking order ? ");
	walker.on("entry", entry => {
			if(linux_fname == entry.path() ) {
			console.log("got " + linux_fname);
			//cb({"content": entry.getBlob()}, res);
			entry.getBlob().then(blob => cb({"content": blob.toString()}, res) );


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






//===
/**
 * @swagger
 * /api/edit/{dirName}/{fname}:
 *   get:
 *     tags:
 *       - edit an existing file
 *     description: Returns the existing file content
 *     produces:
 *       - application/json 
 *     consumes": 
 *       - plain/text
 *       - application/xml
 *     parameters:
 *       - name: dirName
 *         description: dirName for the newly added file
 *         in: path
 *         required: true
 *         type: string 
 *       - name: fname 
 *         description: filename for the newly added file 
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: the existing file content 
 *         schema:
 *            type:  object
 */
router.get('/edit/:dirName/:fname', (req, res) => {
		const fname=req.params.fname;
		var dirName=req.params.dirName.trim();
		if(dirName== "." || dirName=="/") dirName="";
		//dirName.strip('/');
		var linux_fname=path.join(dirName, fname).replace("/\\/g", "/");
		var _repo,_oid,_index, _fileContent;
		var oidStr;
		var repoDirName=path.resolve(notesDir);
		console.log("noteDir resolved to " + repoDirName);
		console.log("dirName/fname resolved to " + linux_fname);

		const cb= function(o,res){ res.json(o);};

		Git.Repository.open(repoDirName)
		.then(function(repoResult) {
			_repo = repoResult;
			return _repo.getMasterCommit();
			}).then(function(firstCommitOnMaster) {
				return firstCommitOnMaster.getTree();
				}).then(function(tree) {
					mytreefind(tree, linux_fname, res,cb);
					}).catch(err=> console.log(err));

});
module.exports = router;
