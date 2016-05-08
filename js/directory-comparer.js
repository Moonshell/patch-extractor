/**
 * Created by krimeshu on 2016/5/8.
 */

var fs = require('fs'),
    path = require('path');

module.exports = {
    process: function (fromDir, toDir) {
        this.checkDirectories(fromDir, toDir);
        var fromChildren = fs.readdirSync(fromDir),
            toChildren = fs.readdirSync(toDir),
            fromMap = {},
            toMap = {};

        fromChildren.forEach(function (fromChild) {
            fromMap[fromChild] = true;
        });
        toChildren.forEach(function (toChild) {
            toMap[toChild] = true;
        });

        // Todo: 区分文件与目录的不同比较

        var result = {
            newFiles: [],
            deletedFiles: [],
            modifiedFiles: []
        }, child, fromChild, toChild;

        for (child in fromMap) {
            if (!fromMap.hasOwnProperty(child)) {
                continue;
            }
            fromChild = path.resolve(fromDir, child);
            if (!toMap[child]) {
                result.deletedFiles.push(fromChild);
            }
        }
        for (child in toMap) {
            if (!toMap.hasOwnProperty(child)) {
                continue;
            }
            toChild = path.resolve(toDir, child);
            fromChild = path.resolve(fromDir, child);
            if (!fromMap[child]) {
                result.newFiles.push(toChild);
            } else {
                if (this.isFileModified(fromChild, toChild)) {
                    result.modifiedFiles.push(toChild);
                }
            }
        }

        return result;
    },
    checkDirectories: function (fromDir, toDir) {
        var fromStat = fs.statSync(fromDir),
            toStat = fs.statSync(toDir);
        if (!fromStat.isDirectory()) {
            throw new Error('旧版路径并不是目录');
        }
        if (!toStat.isDirectory()) {
            throw new Error('新版路径并不是目录');
        }
    },
    isFileModified: function (fromFile, toFile) {
        var fromStat = fs.statSync(fromFile),
            toStat = fs.statSync(toFile);
        return (fromStat.size !== toStat.size ||
        fromStat.mtime !== toStat.mtime);
    }
};