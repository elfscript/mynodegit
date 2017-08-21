const Git = require("nodegit");
const path = require("path");
const myutil =require("../../myutil");

const {routerxxx, gitReposDir, notesDir,myrouter} = require('./router_core');

var router=myrouter();
//routerxxx is the skeleton instance 
//myrouter() will create a new instance 
router.use('/', require('./index1.js'));
router.use('/', require('./index2.js'));
router.use('/', require('./index3.js'));


//==================


/**
 * @swagger
 * definitions:
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

module.exports = router;
