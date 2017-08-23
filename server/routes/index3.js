const path=require("path");
const Git = require("nodegit");
const {router, gitReposDir, notesDir}=require("./router_core");
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));

//===
/**
 * @swagger
 * /api/add/{dirName}/{fname}:
 *   post:
 *     tags:
 *       - add a new file
 *     description: Returns blob content
 *     produces:
 *       - plain/text 
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
 *       - name: body
 *         in: body
 *         required: true
 *         description: file content to be added
 *         schema:
 *           type: object 
 *     responses:
 *       200:
 *         description: new filename
 *         schema:
 *            type:  string
 */
router.post('/add/:dirName/:fname', (req, res) => {
		//const fileContent = JSON.stringify(req.body);//.toString();
                const fileContent=req.body.content;
                console.log("fileContent, " + fileContent);
		const fname=req.params.fname;
		const dirName=req.params.dirName;
		var _repo,_oid,_index;
		var oidStr;
		var repoDirName=path.resolve(notesDir);
		console.log("noteDir resolved to " + repoDirName);

		Git.Repository.open(repoDirName)
		.then(function(repoResult) {
			_repo = repoResult;
			return fse.ensureDir(path.resolve(repoDirName, dirName));
			}).then(function(){
				return fse.writeFile(path.resolve(repoDirName, dirName, fname), fileContent);
				}).catch(err=>console.log(err) )
		.then(function() {
			return _repo.refreshIndex();
			})
		.then(function(indexResult) {
			_index = indexResult;
                        var linux_fname=path.join(dirName,fname).replace(/\\/g, '/');
			return _index.addByPath(linux_fname);
			}).catch(err=>console.log(err) )
		.then(function() {
				return _index.write();
				}).catch(err=>console.log(err) )

		.then(function() {
				return _index.writeTree();
				}).catch(err=>console.log(err) )

		.then(function(oidResult) {
				_oid = oidResult;
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
				return _repo.createCommit("HEAD", author, committer, "message", _oid, [prevCommit]);
				}).catch(err=>console.log(err) )
                                .then(function(){
					res.json({id: _oid.toString(), fname:fname, content:fileContent});
					});
});

router.put('/note/', (req, res) => {
		const updatedNoteData = req.body;

		// Update updatedNoteData to DB
		db.collection('notes')
		.update({ id: updatedNoteData.id }, { $set: updatedNoteData }, (err) => {
			if (err) {
			console.log(err);
			} else {
			db.collection('notes')
			.find({ id: updatedNoteData.id })
			.next((errInner, doc) => {
				if (errInner) {
				console.log('error ', errInner);
				} else {
				res.json(doc);
				}
				})
			}
			})
		});

router.delete('/note/', (req, res) => {
		const deletedNoteDataId = req.body.id;
		db.collection('notes')
		.remove({ id: deletedNoteDataId }, (err, result) => {
			if (err) {
			console.log('error ', err);
			} else {
			res.json(result);
			}
			});
		});

module.exports = router;
