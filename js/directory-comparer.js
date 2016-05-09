/**
 * Created by krimeshu on 2016/5/8.
 */

var fs = require('fs'),
    path = require('path');

try {
    fs = require('original-fs');
} catch (e) {
}

module.exports = {
    process: function (fromRootDir, toRootDir, relPath, _result) {
        var fromDir = path.resolve(fromRootDir, relPath || ''),
            toDir = path.resolve(toRootDir, relPath || '');
        // 预先检查路径是否有误
        this.checkDirectories(fromDir, toDir);
        var fromChildren = fs.readdirSync(fromDir),
            toChildren = fs.readdirSync(toDir),
            fromMap = {},
            toMap = {},
            CHILD_TYPE = {
                FILE: 1,
                DIRECTORY: 2
            };

        // 建立旧目录与新目录的键缓存
        fromChildren.map(function (child) {
            var extName = path.extname(child),
                fromChild = path.resolve(fromDir, child),
                stat = fs.statSync(fromChild);
            fromMap[fromChild] = extName !== '.asar' && stat.isDirectory() ? CHILD_TYPE.DIRECTORY : CHILD_TYPE.FILE;
            return fromChild;
        });
        toChildren.map(function (child) {
            var extName = path.extname(child),
                toChild = path.resolve(toDir, child),
                stat = fs.statSync(toChild);
            toMap[toChild] = extName !== '.asar' && stat.isDirectory() ? CHILD_TYPE.DIRECTORY : CHILD_TYPE.FILE;
            return toChild;
        });

        var result = _result || {
                created: [],
                deleted: [],
                modified: []
            };
        var child, fromChild, toChild;

        // 先跑一遍旧目录的成员，筛选被删掉的成员
        for (fromChild in fromMap) {
            if (!fromMap.hasOwnProperty(fromChild)) {
                continue;
            }
            child = path.relative(fromRootDir, fromChild);
            toChild = path.resolve(toRootDir, child);
            if (!toMap[toChild]) {
                result.deleted.push(child);
            }
        }
        // 再跑一遍新目录的成员
        for (toChild in toMap) {
            if (!toMap.hasOwnProperty(toChild)) {
                continue;
            }
            child = path.relative(toRootDir, toChild);
            fromChild = path.resolve(fromRootDir, child);
            // 先检测创建的新成员
            if (!fromMap[fromChild]) {
                result.created.push(child);
            } else {
                // 如果不是新创建的，则先确保是否类型对应
                if (fromMap[fromChild] !== toMap[toChild]) {
                    if (toMap[toChild] === CHILD_TYPE.FILE) {
                        throw new Error('新文件不能与旧目录同名：' + toChild);
                    } else {
                        throw new Error('新目录不能与旧文件同名：' + toChild);
                    }
                }
                // 再检测是否目录，目录则递归
                if (toMap[toChild] === CHILD_TYPE.DIRECTORY) {
                    this.process(fromRootDir, toRootDir, child, result);
                }
                // 是文件的话，检测是否有改动
                else if (this.isFileModified(fromChild, toChild)) {
                    result.modified.push(child);
                }
            }
        }

        return result;
    },
    checkDirectories: function (fromDir, toDir) {
        if (!fs.existsSync(fromDir)) {
            throw new Error('旧版路径不存在');
        }
        if (!fs.existsSync(toDir)) {
            throw new Error('新版路径不存在');
        }
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
            toStat = fs.statSync(toFile),
            bufferCompare = Buffer['compare'];
        if (!bufferCompare) {
            throw new Error('未找到 Buffer.compare 方法，请检查 Node 版本');
        }
        // 先比较文件基本属性
        if (fromStat.size !== toStat.size) {
            return true;
        }
        try {
            var fromBuffer = fs.readFileSync(fromFile),
                toBuffer = fs.readFileSync(toFile);
            // 再比较文件内容
            return (bufferCompare(fromBuffer, toBuffer) !== 0);
        } catch (e) {
            debugger;
            throw e;
        }
    }
};