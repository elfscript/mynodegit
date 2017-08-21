const path=require("path");
const Git = require("nodegit");
const {router, gitServerDir, notesDir}=require("./router_core");

//===
/**
 * @swagger
 * definitions:
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
//=== when input a tree id or non-blob id  , repo.getBlob() just pending and never return???
router.get('/blob/:id', (req, res) => {
		var oidStr = req.params.id;
                var dirName=path.resolve(notesDir);
		console.log("noteDir resolved to " + dirName);

		Git.Repository.open(dirName)
		.then(function(repo) {
                     repo.getBlob(oidStr).then(function(blob) {
                       if(blob) res.json({id:oidStr, blob:blob.toString()});
                       else res.json({id:oidStr, blob:"not a blob"});
                    });	
		}).catch(err => console.log(err));

	});


//=========

module.exports = router;
