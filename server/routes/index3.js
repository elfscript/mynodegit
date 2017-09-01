const path=require("path");
const Git = require("nodegit");
const {router, gitReposDir, notesDir}=require("./router_core");
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));

//===

const add_commit= (req, res) => {
	const fileContent=req.body.content;
	console.log("fileContent, " + fileContent);
	const fname=req.params.fname;
	const dirName=req.params.dirName;
	var msg=req.query.msg;
        console.log("msg= "+ msg);
	if(!msg) msg="commit msg";

	var _repo,_treeid,_index, _linux_fname, _cmtid;
	var repoDirName=path.resolve(notesDir);
	console.log("noteDir resolved to " + repoDirName);

	Git.Repository.open(repoDirName)
		.then(function(repoResult) {
				_repo = repoResult;
				return fse.ensureDir(path.resolve(repoDirName, dirName));
				}).then(function(){
					return fse.writeFile(path.resolve(repoDirName, dirName, fname), fileContent);
					}).catch(err=>console.log("fse.writeFile() error: "+err) )
	.then(function() {
			return _repo.refreshIndex();
			})
	.then(function(indexResult) {
			_index = indexResult;
			_linux_fname=path.join(dirName,fname).replace(/\\/g, '/');
			return _index.addByPath(_linux_fname);
			}).catch(err=>console.log(err) )
	.then(function() {
			return _index.write();
			}).catch(err=>console.log(err) )

	.then(function() {
			return _index.writeTree();
			}).catch(err=>console.log(err) )

	.then(function(oid) {
			_treeid = oid;
			return Git.Reference.nameToId(_repo, "HEAD");
			}).catch(err=>console.log(err) )

	.then(function(head) {
			return _repo.getCommit(head);
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
			console.log(_cmtid.toString() + " commit success, ");
			return _repo.getCommit(oid).then(cmt => {
				return cmt.getEntry(_linux_fname).then(treeEntry => {
					console.log(_linux_fname + " treeEntry found ");
					return treeEntry.getBlob();}); 
				});
			})
	.then(blob => {
			var blobid=blob.id(); //sync call
			res.json({linux_fname: _linux_fname, dirName: dirName, fname:fname, blobid: blobid.toString(), cmtid:_cmtid.toString()});
			});
};

/**
 * @swagger
 * /api/add/{dirName}/{fname}?msg={msg}:
 *   post:
 *     tags:
 *       - add a new file
 *     description: Returns blob content
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
 *       - name: body
 *         in: body
 *         required: true
 *         description: file content to be added
 *         schema:
 *           type: object 
 *     responses:
 *       200:
 *         description:  {dirName/filename, blobid, commitid}
 *         schema:
 *            type: object 
 */
router.post('/add/:dirName/:fname', add_commit);



/**
 * @swagger
 * /api/update/{dirName}/{fname}?msg={msg}:
 *   put:
 *     tags:
 *       - update an existing file
 *     description: Returns new blob id, commit id
 *     produces:
 *       - application/json 
 *     parameters:
 *       - name: dirName
 *         description: dirName for the  file
 *         in: path
 *         required: true
 *         type: string 
 *       - name: fname 
 *         description: filename for the file 
 *         in: path
 *         required: true
 *         type: string
 *       - name: msg
 *         description: commit msg
 *         in: query
 *         required: false
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         description: file content to be added
 *         schema:
 *           type: object 
 *     responses:
 *       200:
 *         description:  "{dirName/filename, blobid, commitid}"
 *         schema:
 *            type: object 
 */
router.put('/update/:dirName/:fname', add_commit);


module.exports = router;
