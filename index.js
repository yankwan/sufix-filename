const fs = require('fs');
const path = require('path');
const program= require('commander');
const crypto = require('crypto');

/**
 * 自定义指令
 */
program
    .version('0.1.0')
    .option('--replace <value>', 'Replace filename to the value, value is required')
    .option('--suffix [value]', 'Add suffix, value is optional, default value is timestamp')
    .option('--prefix [value]', 'Add prefix, value is optional, default value is timestamp')
    .option('--sep <value>', 'Add separator, value is optional, default value is none')
    .option('--encode <items>', 'Use user encode type to encode suffix/prefix, value is required')
    .option('--encode-join <items>', 'Use user encode type to encode suffix/prefix and join the encode result, value is required')
    .parse(process.argv);

/**
 * 编码类型
 */
const encodeType = [
    'md5',
    'sha1',
    'sha256',
    'sha512'
];


/**
 * args[0]: 文件目录地址
 * 
 * example: node index.js 'E:/test/dir' --suffix 
 */
let args = [].slice.call(process.argv, 2);
let curDir = path.join(args[0]);

/**
 * Start
 */
visit(curDir, (filePath, fileName) => {
    let oldPath = path.join(filePath, fileName);
    let newPath;

    // 添加文件名后缀
    if (program.suffix) {
        fileName = suffixFileName(fileName, program.suffix, program.sep)
    }

    // 添加文件名前缀
    if (program.prefix) {

    }

    newPath = path.join(filePath, fileName);
    rename(oldPath, newPath);
})


/**
 * Encode值数组化
 * example: md5,hash
 */
function formatEncodeItems (items) {
    return items.split(',');
}

/**
 * 添加文件名后缀
 * @param {*} fileName 
 * @param {*} postFix 
 * @param {*} sep 
 */
function suffixFileName (fileName, suffix, sep = '') {

    if (typeof suffix === 'boolean') suffix = new Date().getTime();

    let tmp = fileName.split('.');
    if (tmp.length > 2) {
        throw 'filename is not valid';
    }
    return tmp[0] + sep + encodeContent(suffix) + '.' + tmp[1];
}

/**
 * 编码内容
 * @param {*} content 
 */
function encodeContent (content) {

    if (program.encode) {
        let encodeItems = formatEncodeItems(program.encode);
        encodeItems.forEach(encode => {
            if (encodeType.indexOf(encode) != -1) {
                let hash = crypto.createHash(encode);
                hash.update(content + '');
                content = hash.digest('hex');
            }
        })
    } else if (program.encodeJoin) {
        let encodeItems = formatEncodeItems(program.encodeJoin);
        let encodeTemp;
        encodeItems.forEach(encode => {
            if (encodeType.indexOf(encode) != -1) {
                let hash = crypto.createHash(encode);
                hash.update(content + '');
                encodeTemp += hash.digest('hex');
            }
        })

        content = encodeTemp;
    }

    return content;
}

/**
 * 修改文件名
 * @param {*} oldPath 
 * @param {*} newPath 
 */
function rename (oldPath, newPath) {
    fs.rename(oldPath, newPath, err => {
        if (err) throw err;
    })
}

/**
 * 遍历文件信息
 * @param {*} filePath 文件目录
 * @param {*} cb 需要执行的回调函数
 */
function visit (filePath, cb) {
    let files = fs.readdirSync(filePath);
    
    files.forEach(fileName => {
        var stats = fs.statSync(path.join(filePath, fileName));
        if (stats.isDirectory()) visit(path.join(filePath, fileName), cb);
        else 
            cb(filePath, fileName);
    })
    
}