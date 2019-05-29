/**
 * Created by zhangfei on 2018/12/4.
 */

const fs = require("fs");
const pathTools = require('path');
/**
 * 模块目录扫描加载器
 */
class ModelLoad {

    constructor(path, filename, excludeDir = ""){
        this.path = path;
        this.self = filename.substring(__dirname.length + 1);
        this.models = {};// 存放读取的model
        this.floder = [];// 声明一个数组存储目录下的所有文件夹
        this.excludeDir = excludeDir; // 排除扫描目录
    }

    load() {
        this.files();

        this.floder.sort();
        for (var i = 0; i < this.floder.length; i++) {
            this.readDir(this.floder[i]);
        }
        return this.models;
    }

    readDir(path) {
        let self = this;
        let files = fs.readdirSync(path);
        console.log("加载目录：" + path);
        files.forEach(function(filename) {
            let filePath = path + pathTools.sep + filename;
            let stat = fs.lstatSync(filePath);
            if(stat.isDirectory()){
                self.readDir(filePath);
            } else {
                let pos = filename.lastIndexOf('.');
                if (pos == -1)
                    return;
                let filePrefix = filename.substr(0, pos);
                let filePostfix = filename.substr(pos + 1);
                if (filePrefix.length < 1 || filePostfix.length < 1) {
                    return;
                }
                if (filePostfix != 'js' && filePostfix != 'art') {
                    return;
                }

                let fileFullPath = path + pathTools.sep + filePrefix;
                console.log("加载文件：" + fileFullPath);
                let dirpos = path.lastIndexOf(pathTools.sep);
                if(dirpos == -1)
                    return;
                let dirName = path.replace(self.path + pathTools.sep, '');
                let dirs = dirName.split(pathTools.sep);
                let modles = self.models;
                dirs.forEach(function(dir) {
                    if (dir && modles[dir] === undefined) {
                        modles[dir] = {};
                    }
                    modles = modles[dir];
                });

                modles[filePrefix] = require(fileFullPath);
            }
        });
    }

    renderWrap(modle) {
        return function(resData){
            let result = modle(resData);
            return (new Function("return " + result))();
        };
    }

    files() {
        var self = this;
        var files = fs.readdirSync(self.path);
        files.forEach(function(filename){
            var filePath = self.path + pathTools.sep + filename;
            if (filename !== self.excludeDir) {
                var stat = fs.lstatSync(filePath);
                if(stat.isDirectory()){
                    self.floder.push(filePath);
                }
            }
        });
    }
}

module.exports = ModelLoad;
