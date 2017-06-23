var fs = require('fs');

function copy(oldPath, newPath, callback) {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }


function p_copy(oldPath, newPath){
  return new Promise((resolve, reject) => {
      copy(oldPath, newPath,(err, res) => {
        if (err) {
            reject(err)
        } else
            resolve(res);
    });
 })
}

function p_move(oldPath, newPath) {

 return new Promise((resolve, reject) => {    
      fs.rename(oldPath, newPath,(err, res) => { 
        if (err) {
            reject(err)
        } else 
	    resolve(res);
    });
 }
);

}

function p_mv_cp(oldPath, newPath){
  return p_move(oldPath, newPath)
   .catch(function(err){
         if (err.code === 'EXDEV')
           return p_copy(oldPath, newPath);
         else
           console.log("p_mv_cp(), "+ err);
 });
}




//=== To remove folder Syncronously

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


//===
module.exports={
	rmdir:deleteFolderRecursive,
	mv:p_mv_cp,
}
