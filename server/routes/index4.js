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
			entry.getBlob().then(blob => 
				{
				walker.removeAllListeners();
				tree.free();
				//walker.free();
				//neither will stop the walking ???

				cb({"content": blob.toString()}, res); 
				});
			}else {
			console.log(entry.path());
			}
			});
	walker.start();

}




function core(repoDir, linux_fname, res){
	const cb= function(o,res){ res.json(o);};

	Git.Repository.open(repoDir)
		.then(function(repo) {
				return repo.getMasterCommit();
				}).then(function(firstCommitOnMaster) {
					return firstCommitOnMaster.getTree();
					}).then(function(tree) {
						mytreefind(tree, linux_fname, res,cb);
						}).catch(err=> console.log(err));




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
		var dirName=req.params.dirName; 
		if(dirName) dirName= dirName.trim();
		else dirName="";

		if(dirName== "." || dirName=="/") dirName="";
		var linux_fname=path.join(dirName, fname).replace("/\\/g", "/");
		var repoDirName=path.resolve(notesDir);
		console.log("noteDir resolved to " + repoDirName);
		console.log("dirName/fname resolved to " + linux_fname);
		core(repoDirName, linux_fname, res);
		});


//===
/**
 * @swagger
 * /api/edit/{fname}:
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
router.get('/edit/:fname', (req, res) => {
		const fname=req.params.fname;
		var linux_fname= fname.replace("/\\/g", "/");
		var repoDirName=path.resolve(notesDir);
		console.log("noteDir resolved to " + repoDirName);
		console.log("dirName/fname resolved to " + linux_fname);
		core(repoDirName, linux_fname, res);

		});


//===


module.exports = router;
