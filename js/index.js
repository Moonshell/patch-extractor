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
        var text = $(holder).find('.text');
        text.innerHTML = file.path;
        text.style.fontSize = '16px';
    }
});

DropManager.register({
    holder: $('#box_toVersion')[0],
    hoverClass: 'hover',
    onDrop: function (file, holder) {
        var text = $(holder).find('.text');
        text.innerHTML = file.path;
        text.style.fontSize = '16px';
    }
});

$('#btn_compare').on('click', function () {
    var fromPath = $('#box_fromVersion .text').html(),
        toPath = $('#box_toVersion .text').html();

    if(!fromPath) {
        alert('没选择旧版位置');
        return;
    }
});

