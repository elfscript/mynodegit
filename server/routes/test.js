//xxx const {router1, gitServerDir1, notesDir1}=require("./router_core");
//xxx const {router2, gitServerDir2, notesDir2}=require("./router_core");
const x1=require("./router_core");
const x2=require("./router_core");
console.log( x1==x2);
console.log("x1==x2, " + (x1==x2).toString());
console.log(x1.router);

var router1=x1.router;
var router2=x2.router;
console.log("router1==router2, "+ (router1==router2) );


obj1={k1:"v1", k2:"v2"};
obj2={k1:"v1", k2:"v2"};
console.log("obj1==obj2, " + (obj1==obj2));


/*xxx {k2,v2}=obj1
console.log(k2);
*/



const express=require('express');
const router3 = express.Router();
console.log("router3==router1, " + (router3==router1));

const router4 = express.Router();
console.log("router3==router4, " + (router3==router4));

router3.myk1="v1";
console.log("after set myk1, router3==router4, " + (router3==router4));


/*console.log(router3);
console.log(gitServerDir1);
console.log(gitServerDir1==gitServerDir2);
*/
