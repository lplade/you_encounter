/**
 * Created by lade on 4/5/16.
 */
// Tests functionality of reading external JSON file in Node
var inFile = require('./monsters.json');

//var fs = require('fs');

//Pull in array of monsters
//https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback
//var monsterObj = JSON.parse(
//monsterObj = fs.readFileSync('./monsters.json', 'utf8');
//fs.closeSync('./monsters.json');
//console.log(monsterObj);
console.log(inFile);
console.log(inFile.length);
