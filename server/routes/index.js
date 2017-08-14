const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');

const router = express.Router();

router.use(cors());

const Git = require("nodegit");


//=========
var path = require("path");
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));


const gitServerDir = "/workspaces/mynodegit/gitRepos";
const notesDir=gitServerDir + '/notes';

router.get('/demo1',(req, res) => {

		var fileName = "newfile.txt";
		var fileContent = "hello world, demo1";
		var dirName="demo1";
		var fullName="";
		var sub_fullName;
		// ensureDir is an alias to mkdirp, which has the callback with a weird name
		// and in the 3rd position of 4 (the 4th being used for recursion). We have to
		// force promisify it, because promisify-node won't detect it on its
		// own and assumes sync
		fse.ensureDir = promisify(fse.ensureDir);

		/**
		 * This example creates a certain file `newfile.txt`, adds it to the git
		 * index and commits it to head. Similar to a `git add newfile.txt`
		 * followed by a `git commit`
		 **/

		var repo;
		var index;
		var oid;

		Git.Repository.open(path.resolve(gitServerDir, "notes/.git"))
			.then(function(repoResult) {
					repo = repoResult;
					console.log("repo opened, repo.workdir()="+ repo.workdir());
					return fse.ensureDir(path.join(repo.workdir(), dirName));
					}).catch( function(err){ console.log(err);} )
		.then(function() {
				fullName=path.resolve(repo.workdir(), dirName, fileName);
				console.log("fullName= " + fullName);
				sub_fullName=path.join(dirName, fileName); 
				console.log("sub_fullName=" + sub_fullName);
				return fse.writeFile( fullName,	fileContent);
				}).catch( function(err){ console.log(err);} )
		.then(function() {
				return repo.refreshIndex();
				}).catch(function(err){ console.log(err);})
		.then(function(indexResult) {
				index = indexResult;
				})
		.then(function() {
				// this file is in a subdirectory and can use a relative path
				console.log("process.cwd()= " + process.cwd());
				//git_fullName= path.join(gitServerDir,'notes',sub_fullName);
				git_fullName= path.join(repo.workdir(),sub_fullName);
				console.log("path.join(): " + git_fullName);
				git_fullName = git_fullName.replace(/\\/g, '/');
				sub_fullName = sub_fullName.replace(/\\/g, '/');
				console.log("git_fullName=" + git_fullName); 	
				//process.chdir();
				return index.addByPath(sub_fullName);
				}).catch( function(err){ console.log(err);} )
		.then(function() {
				// this will write both files to the index
				return index.write();
				})
		.then(function() {
				return index.writeTree();
				}).catch(function(err){console.log(err);})
		.then(function(oidResult) {
				oid = oidResult;
				//return nodegit.Reference.nameToId(repo, "HEAD");
				console.log("oid=" + oid); 
				})

} );

//=== notes/cat0, cat1, cat2, ..., 
//=== cat0 is the default notebook 
//var fs= require('fs');
const myutil=require('../../myutil'); 

var fnames=[];
//=== to list the files under notes.git 

/**
 * @swagger
 * definition:
 *   Note:
 *     properties:
 *       name:
 *         type: string
 *       tstr:
 *         type: string
 *       mtime:
 *         type: number 
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     tags:
 *       - notes
 *     description: Returns all notes
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of notes
 *         schema:
 *           $ref: '#/definitions/Note'
 */
router.get('/notes', (req, res) => {
		console.log("routes api, /notes matching");
		var dirName=path.resolve(notesDir);
		console.log("noteDir resolved to " + dirName);
		//fs.readdir=promisify(fs.readdir);
		fse.readdir(dirName).then( files => {files.forEach(file=> {console.log(file);});
			fnames=files.filter(fname => {
				if(fname == ".git") return false;
				else return true;
				} ); })

		.catch(err =>{ console.log(err);})
		.then( () => { var fInfos=fnames.map(function(v) {
				var mtime= fse.statSync( path.join(dirName, v) ).mtime.getTime(); 
				var tstr=myutil.timestamp2DateString(mtime);

				return { name:v, mtime:mtime, tstr:tstr}; 


				})
			.sort(function(a, b) { return b.mtime - a.mtime; }); 
			console.log(fInfos);
			res.json(fInfos); })
		.catch(err =>{ console.log(err);});
});



//===
/**
 * @swagger
 * definition:
 *   Blob:
 *     properties:
 *       id:
 *         type: string
 *       blob:
 *         type: string
 */


/**
 * @swagger
 * /api/blob/{id}:
 *   get:
 *     tags:
 *       - blob 
 *     description: Returns blob content 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: blob oid(sha1 chksum)
 *         in: path
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: blob content 
 *         schema:
 *           $ref: '#/definitions/Blob'
 */

router.get('/blob/:id', (req, res) => {
		var oidStr = req.params.id;
                var dirName=path.resolve(notesDir);
		console.log("noteDir resolved to " + dirName);

		Git.Repository.open(dirName)
		.then(function(repo) {
                     repo.getBlob(oidStr).then(function(blob) {
			res.json({id:oidStr, blob:blob.toString()});
                    });	
		}).catch(err => console.log(err));

	});

//==================


/**
 * @swagger
 * definition:
 *   IndexEntry:
 *     properties:
 *       id:
 *         type: string
 *       path:
 *         type: string 
 *       tstr:
 *         type: string
 *       mtime:
 *         type: number
 *       ctime:
 *         type: number 
 */

/**
 * @swagger
 * /api/indexentries:
 *   get:
 *     tags:
 *       - IndexEntries 
 *     description: Returns array of indexEntries
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of indexEntries
 *         schema:
 *           $ref: '#/definitions/IndexEntry'
 */

router.get('/indexentries', (req, res) => {
		console.log("routes api, /indexentries matching");

		var dirName=path.resolve(notesDir);
		console.log("noteDir resolved to " + dirName);

		Git.Repository.open(dirName)
		.then(function(repo) {
			return repo.refreshIndex()
			.then(function(index) {
				var files = index.entries().filter(function(entry) {
					//if(entry.path.indexOf(".js") >=0 )
					return true;
					});

				console.log(
					"\n-------------------\n" +
					"index entries: " +
					"\n-------------------\n");
				files.forEach(function(entry) {
					console.log(entry.path);
					});
				var fInfos=files.map(function(file) {
					var mtime= file.mtime.seconds()*1000; 
					var tstr=myutil.timestamp2DateString(mtime);

					return { id: file.id.toString(), path:file.path, mtime:mtime, tstr:tstr, ctime:file.ctime.seconds()*1000}; 


					}).sort(function(a, b) { return b.mtime - a.mtime; }); 

				res.json(fInfos); 
			}).catch(err =>{ console.log(err);});

		});
});

//===


const tree_entries_walk= (req, res) => {
	console.log("routes api, /tree_entries matching");

	var dirName=path.resolve(notesDir);
	//var files=[];

	console.log("noteDir resolved to " + dirName);

	Git.Repository.open(dirName)
		.then(function(repo) {
				return repo.getMasterCommit();
				})
	.then(function(firstCommitOnMaster) {
			return firstCommitOnMaster.getTree();
			})
	.then(function(tree) {
			// `walk()` returns an event.
			var walker = tree.walk();
			walker.on("entry", function(entry) {
				console.log("walker: " +entry.path());
				//files.push({"fname":entry.path()});
				});

			// Don't forget to call `start()`!
			walker.on("end", finalEntries => {
				console.log(finalEntries);
				j_entries=finalEntries.map( entry=>{ return {name:entry.path(), oid:entry.oid()}; });
				res.json(j_entries); 
				});
			walker.start();
			}).catch(err =>{ console.log(err);} );
	/*.then(function(files){
	//	res.json({'k1':'v1', 'k2':'v2', 'k3':'v3'});
	res.json(files);	
	}).catch(err =>{ console.log(err);});*/

};

router.get('/tree_entries', tree_entries_walk); 


//=========
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/add/:fname', (req, res) => {
		const newNoteData = req.body;
		const fname=req.params.fname;

		var newId = 0;

		// Get Latest ID
		db.collection('notes').find()
		.sort({ id: -1 })
		.limit(1)
		.next((err, doc) => {
			if (err) {
			console.log('error ', err);
			} else {
			newId = doc.id;
			newNoteData.id = newId + 1;
			// Store newNoteData to DB
			db.collection('notes').insertOne(newNoteData, (errInsert, result) => {
				if (err) {
				console.log('error ', err);
				} else {
				const newId = result.insertedId;
				db.collection('notes').find({ _id: newId }).next((errInner, docInsert) => {
					if (errInner) {
					console.log('error ', errInner);
					} else {
					res.json(docInsert);
					}
					});
				}
				});
			}
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
