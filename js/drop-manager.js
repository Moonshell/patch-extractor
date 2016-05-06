/**
 * Created by krimeshu on 2016/5/6.
 */

document.ondragover = document.ondrop = function (e) {
    e.preventDefault();
    return false;
};

module.exports = {
    register: function (opt) {
        var holder = opt.holder,
            hoverClass = opt.hoverClass,
            onDrop = opt.onDrop;
        holder.ondragover = function () {
            holder.classList.add(hoverClass);
            return false;
        };
        holder.ondragleave = holder.ondragend = function () {
            holder.classList.remove(hoverClass);
            return false;
        };
        holder.ondrop = function (e) {
            holder.classList.remove(hoverClass);
            e.preventDefault();

            var file = e.dataTransfer.files[0];
            onDrop(file, holder);
            return false;
        };
    }
};