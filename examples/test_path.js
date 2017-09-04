const path= require('path');
dirName= "cat33";
fname= "f33.txt";

//xxx linux_fname=path.join(dirName, fname).replace("/\\/g", "/");
linux_fname=path.join(dirName, fname).replace(/\\/g, "/");


fname1= dirName + "/" + fname;
fname2=  path.join(dirName, fname);
fname3= path.normalize(fname1);
fname4= path.resolve(fname2);
fname5= path.resolve(dirName, fname);

console.log(fname1);
console.log(fname2);
console.log(fname3);
console.log(fname4);
console.log(fname5);
console.log(linux_fname);

var s="cat33\\f33.txt";
console.log("======================");
console.log(fname1==s);
console.log(fname2==s);
console.log(fname3==s);
console.log(fname4==s);
console.log(fname5==s);
console.log(linux_fname==s);

