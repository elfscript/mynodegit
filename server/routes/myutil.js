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

//========== to convert unix timestamp
function timestamp2DateString(UNIX_timestamp) {
    var x= new Date(UNIX_timestamp);
    var hour = String(x.getUTCHours())
    if (hour.length == 1) {
        hour = '0' + hour;
    }
    var minutes = String(x.getUTCMinutes())
    if (minutes.length == 1) {
        minutes = '0' + minutes;
    }
    var secs = String(x.getUTCSeconds())
    if (secs.length == 1) {
        secs = '0' + secs;
    }

    var time = hour + ':' + minutes + ":" + secs;
    var yyyy = x.getFullYear();
    var mm = ('0' + (x.getMonth() + 1)).slice(-2); // Months are zero basex. Add leading 0.
    var dd = ('0' + x.getUTCDate()).slice(-2);  // Add leading 0.
    time = yyyy + '.' +mm +  '.' + dd + ' UTC ' +time;	 
    return time;
}

//===
module.exports={
	rmdir:deleteFolderRecursive,
	mv:p_mv_cp,
        timestamp2DateString:timestamp2DateString,
}
