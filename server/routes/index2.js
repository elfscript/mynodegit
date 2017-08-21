const Git = require("nodegit");
const {router, gitReposDir, notesDir}= require('./router_core');
const path = require("path");



//===
/**
 * @swagger
 * definitions:
 *   Commit:
 *     properties:
 *       id:
 *         type: string
 *       sha:
 *         type: string
 *       timeMs:
 *         type: number
 *       author:
 *         type: string
 *       message:
 *         type: string
 */

/**
 * @swagger
 * /api/commit/{id}:
 *   get:
 *     tags:
 *       - commit 
 *     description: Returns a commit from the given oid 
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: commit info 
 *         schema:
 *           $ref: '#/definitions/Commit'
 */
router.get('/commit/:id', (req, res) => {
 var oidStr = req.params.id;
 var dirName=path.resolve(notesDir);
 console.log("noteDir resolved to " + dirName);

 Git.Repository.open(dirName)
 .then(function(repo) {
      repo.getCommit(oidStr).then(function(cmt) {
         res.json({id:cmt.id().toString(), msg:cmt.message(), author:cmt.author(), sha:cmt.sha(), tms: cmt.timeMs()});
     });
 }).catch(err => console.log(err));
});

//=========

module.exports = router;
