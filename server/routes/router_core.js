const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const router = express.Router();

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


const gitReposDir = "/workspaces/mynodegit/gitRepos";
const notesDir=gitReposDir + '/notes';


const myrouter=function(opts){ 
	let arouter = express.Router(opts);

	arouter.use(cors());
	arouter.use(bodyParser.json());
	arouter.use(bodyParser.urlencoded({ extended: true }));
	return arouter;
}


module.exports = {
router:router,
       gitReposDir: gitReposDir,
       notesDir: notesDir,
       myrouter: myrouter
};
