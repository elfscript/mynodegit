const path=require("path");
const Git = require("nodegit");
const {router, gitReposDir, notesDir}=require("./router_core");
//var promisify = require("promisify-node");
//var fse = promisify(require("fs-extra"));

//===

const rm_commit= (req, res) => {
	const fname=req.params.fname;
	const dirName=req.params.dirName;
	var msg=req.query.msg;
	console.log("msg= "+ msg);
	if(!msg) msg="rm-and-commit msg";

	var _repo,_treeid,_index, _linux_fname, _cmtid;
	var repoDirName=path.resolve(notesDir);
	console.log("noteDir resolved to " + repoDirName);

	Git.Repository.open(repoDirName)
		.then(function(repoResult) {
				_repo = repoResult;
				return _repo.refreshIndex();
				})
	.then(function(index) {
			_index = index;
			_linux_fname=path.join(dirName,fname).replace(/\\/g, '/');
			return _index.removeByPath(_linux_fname);
			}).catch(err=>console.log(err) )
	.then(function() {
			return _index.write();
			}).catch(err=>console.log(err) )

	.then(function() {
			return _index.writeTree();
			}).catch(err=>console.log(err) )

	.then(function(oid) {
			_treeid = oid;
			return _repo.getHeadCommit();
			}).catch(err=>console.log(err) )
	.then(function(prevCommit) {
			var t= Math.floor(new Date() / 1000);
			var author = Git.Signature.create("elf deng",
				"elfscript@gmail.com", t, 0);
			var committer=author;
			return _repo.createCommit("HEAD", author, committer, msg, _treeid, [prevCommit]);
			}).catch(err=>console.log(err) )
	.then(function(oid){
			_cmtid=oid;
			console.log(_cmtid.toString() + " rm-commit success, ");
			return _repo.getCommit(oid).then(cmt => {
				return cmt.getEntry(_linux_fname).then(treeEntry => {
					console.log(_linux_fname + " treeEntry not deleted??? ");
					res.json({linux_fname: _linux_fname, dirName: dirName, fname:fname, cmtid:_cmtid.toString(), err: "treeEntry not deleted??? "});
					});
				});
			}).catch(err=> {
				res.json({linux_fname: _linux_fname, dirName: dirName, fname:fname, cmtid:_cmtid.toString(), err: "treeEntry not found, it shd be deleted. "}); 
				});
};

/**
 * @swagger
 * /api/delete/{dirName}/{fname}?msg={msg}:
 *   delete:
 *     tags:
 *       - delete a  file
 *     description: Returns json object 
 *     produces:
 *       - application/json 
 *     consumes": 
 *       - plain/text
 *       - application/json
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
 *       - name: msg
 *         description: commit msg
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description:  {dirName/filename, commitid, err}
 *         schema:
 *            type: object 
 */
router.delete('/delete/:dirName/:fname', rm_commit);




module.exports = router;
