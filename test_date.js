const myutil=require('./myutil');

var t= Math.floor(new Date() / 1000);
var tstr= myutil.timestamp2DateString(t*1000);

console.log(t);
console.log(tstr);
