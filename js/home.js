/**
 * Created by Garrett on 4/4/2017.
 */

var dragSrcEl = null;

function parsePieces(text) {
    var words = text.split(' ');
    var pieceWrapper = document.createElement('div');
    pieceWrapper.classList.add('line-piece-wrapper');
    pieceWrapper.setAttribute('draggable', true);

    for (var i = 0; i < words.length; ++i) {
        var piece = null;

        switch (words[i]) {
            case '{':
            case '}':
                piece = document.createElement('div');
                break;

            case '...':
                piece = document.createElement('span');
                piece.classList.add('empty-piece');
                break;

            default:
                piece = document.createElement('span');
                break;
        }

        piece.classList.add('line-piece');
        piece.innerHTML = words[i];
        pieceWrapper.appendChild(piece);
    }

    return pieceWrapper;
}

function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);

    this.style.opacity = '0.4';
    dragSrcEl = this;
}

function handleDragOver(e) {
    if(e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if(e.stopPropagation) e.stopPropagation();

    if (dragSrcEl !== this) {
        var data = e.dataTransfer.getData('text/html');
        var temp = document.createElement('div');
        temp.innerHTML = data;
        if(!temp.classList.contains('line-piece'))
            this.innerHTML = parsePieces(temp.innerHTML).outerHTML;
    }

    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    [].forEach.call(lines, function (line) {
        line.classList.remove('over');
    });
}

var pieces = document.querySelectorAll('.piece');
[].forEach.call(pieces, function (piece) {
    piece.addEventListener('dragstart', handleDragStart, false);
    piece.addEventListener('dragend', handleDragEnd, false);
});

var lines = document.querySelectorAll('.line');
[].forEach.call(lines, function (line) {
    line.addEventListener('dragenter', handleDragEnter, false);
    line.addEventListener('dragover', handleDragOver, false);
    line.addEventListener('dragleave', handleDragLeave, false);
    line.addEventListener('drop', handleDrop, false);
    line.addEventListener('dragend', handleDragEnd, false);
});

var lineNums = document.querySelectorAll('.line-numbers .line-number');
[].forEach.call(lineNums, function (num, i) {
    num.innerHTML = i + 1;
});


