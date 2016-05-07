/**
 * Created by krimeshu on 2016/5/6.
 */

var fs = require('fs'),
    path = require('path'),

    DropManager = require('./drop-manager'),
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

$('#btn_compare').on('click', function () {
    var $fromHolder = $('#box_fromVersion'),
        $toHolder = $('#box_toVersion');

    if ($fromHolder.is('.empty')) {
        alert('没选择旧版本位置');
        return;
    }

    if ($toHolder.is('.empty')) {
        alert('没选择新版本位置');
        return;
    }

    var fromPath = $fromHolder.find('.text').html(),
        toPath = $toHolder.find('.text').html();
});

