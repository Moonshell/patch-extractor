/**
 * Created by krimeshu on 2016/5/6.
 */

var fs = require('fs'),
    path = require('path'),
    childProcess = require('child_process'),

    DropManager = require('./drop-manager'),
    DirectoryComparer = require('./directory-comparer'),
    $ = require('./jquery-2.1.4.min');

DropManager.register({
    holder: $('#box_fromVersion')[0],
    hoverClass: 'hover',
    onDrop: function (file, holder) {
        var $holder = $(holder),
            $text = $holder.find('.text');
        $holder.removeClass('empty');
        $text.html(file.path);
    }
});

DropManager.register({
    holder: $('#box_toVersion')[0],
    hoverClass: 'hover',
    onDrop: function (file, holder) {
        var $holder = $(holder),
            $text = $holder.find('.text');
        $holder.removeClass('empty');
        $text.html(file.path);
    }
});

$('#btn_restart').on('click', function () {
    window.location.reload();
});

function goStep(index) {
    $('.step').removeClass('current').filter('[data-step="' + index + '"]').addClass('current');
}

goStep(1);

$('#btn_compare').on('click', function () {
    var $fromHolder = $('#box_fromVersion'),
        $toHolder = $('#box_toVersion'),
        $btn = $('#btn_compare');

    if ($fromHolder.is('.empty')) {
        alert('还没指定旧版本位置');
        return;
    }

    if ($toHolder.is('.empty')) {
        alert('还没指定新版本位置');
        return;
    }

    $btn.attr('data-html', $btn.html()).html('比对中…');
    window.setTimeout(function () {
        var fromPath = $fromHolder.find('.text').html(),
            toPath = $toHolder.find('.text').html(),
            result;
        try {
            result = DirectoryComparer.process(fromPath, toPath);
        } catch (e) {
            console.error(e);
            showMsg('异常：' + e.message, 'color: red;');
        }
        $btn.html($btn.attr('data-html'));
        if (result) {
            showResult(result);
            goStep(2)
        }
    }, 0);
});

function showMsg(text, cssText) {
    var $li = $('<li/>').html(text);
    $li[0].cssText = cssText;
    $('#lst_msgList').append($li);
}

function showResult(result) {
    var $list = $('#lst_diffList');
    $list.empty();
    if (!result) {
        return;
    }

    if (result.deleted.length) {
        $list.append($('<li/>').html('删除文件：'));
        result.deleted.forEach(function (filePath) {
            $list.append($('<li class="deleted"/>').html(filePath));
        });
    }

    if (result.created.length) {
        $list.append($('<li/>').html('新增文件：'));
        result.created.forEach(function (filePath) {
            $list.append($('<li class="created"/>').html(filePath));
        });
    }

    if (result.modified.length) {
        $list.append($('<li/>').html('修改文件：'));
        result.modified.forEach(function (filePath) {
            $list.append($('<li class="modified"/>').html(filePath));
        });
    }
}

$('#btn_makePatch').on('click', function () {
    var $btn = $('#btn_makePatch'),
        $toHolder = $('#box_toVersion'),
        toPath = $toHolder.find('.text').html(),
        exePath = path.resolve('./7z.exe');

    $btn.attr('data-html', $btn.html()).html('打包中…');

    var files = [],
        now = Date.now(),
        fileListName = 'file_list_' + now + '.txt',
        fileListPath = path.resolve(toPath, fileListName);

    $('#lst_diffList').find('li.modified,li.created').each(function () {
        files.push($(this).html());
    });

    fs.writeFileSync(fileListPath, files.join('\n'));

    var ls = childProcess.spawn(exePath, ['a', '-t7z', '../patch_' + now + '.7z', '@' + fileListName], {
        cwd: toPath
    });
    ls.stdout.on('data', function (data) {
        console.log(String(data));
    });
    ls.stderr.on('data', function (data) {
        console.error(String(data));
    });
    ls.on('exit', function (code) {
        console.log('7z child process exited with code ' + code);
        fs.unlink(fileListPath);
        $btn.html($btn.attr('data-html'));
        alert('补丁制作完毕！');
    });
});