/**
 * Created by Garrett on 4/4/2017.
 */

var SrcType = {Piece: 0, LinePiece: 1};
Object.freeze(SrcType);

var dragSrcEl = null;
var dragSrcType = SrcType.Piece;

// TODO add blank pieces in between for placing new pieces
function parsePieces(text) {
    var words = text.split(' ');
    var pieceWrapper = document.createElement('div');
    pieceWrapper.classList.add('line-piece-wrapper');
    pieceWrapper.setAttribute('draggable', true);
    pieceWrapper.addEventListener('dragstart', handleDragStartLinePiece, true);
    pieceWrapper.addEventListener('dragend', handleDragEnd, true);

    for (var i = 0; i < words.length; ++i) {
        var piece = null;

        switch (words[i]) {
            case '{':
            case '}':
                piece = document.createElement('div');
                piece.innerHTML = words[i];
                break;

            case '...':
                piece = document.createElement('span');
                piece.classList.add('empty-piece');
                piece.addEventListener('dragenter', handleDragEnter, false);
                piece.addEventListener('dragover', handleDragOver, false);
                piece.addEventListener('dragleave', handleDragLeave, false);
                piece.addEventListener('drop', handleDropEmptyPiece, false);
                piece.addEventListener('dragend', handleDragEnd, false);
                break;

            default:
                piece = document.createElement('span');
                piece.innerHTML = words[i];
                break;
        }

        piece.classList.add('line-piece');
        pieceWrapper.appendChild(piece);
    }

    return pieceWrapper;
}

function handleDragStartPiece(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);

    this.style.opacity = '0.4';
    dragSrcEl = this;
    dragSrcType = SrcType.Piece;
}

function handleDragStartLinePiece(e) {
    console.log(this.outerHTML);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();

    this.style.opacity = '0.4';
    dragSrcEl = this;
    dragSrcType = SrcType.LinePiece;
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

function handleDropLine(e) {
    if(e.stopPropagation) e.stopPropagation();

    if (dragSrcEl !== this) {
        switch (dragSrcType) {
            case SrcType.Piece:
                var pieces = parsePieces(e.dataTransfer.getData('text/html'));
                this.appendChild(pieces);
                break;
            case SrcType.LinePiece:
                this.appendChild(dragSrcEl);
                break;
        }
    }

    return false;
}

function handleDropEmptyPiece(e) {
    if(e.stopPropagation) e.stopPropagation();

    if (dragSrcEl !== this) {
        switch (dragSrcType) {
            case SrcType.Piece:
                var pieces = parsePieces(e.dataTransfer.getData('text/html'));
                this.replaceWith(pieces);
                break;
            case SrcType.LinePiece:
                this.replaceWith(dragSrcEl);
                break;
        }
    }
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    [].forEach.call(lines, function (line) {
        line.classList.remove('over');
    });
}

var pieces = document.querySelectorAll('.piece');
[].forEach.call(pieces, function (piece) {
    piece.addEventListener('dragstart', handleDragStartPiece, false);
    piece.addEventListener('dragend', handleDragEnd, false);
});

var lines = document.querySelectorAll('.line');
[].forEach.call(lines, function (line) {
    line.addEventListener('dragenter', handleDragEnter, false);
    line.addEventListener('dragover', handleDragOver, false);
    line.addEventListener('dragleave', handleDragLeave, false);
    line.addEventListener('drop', handleDropLine, false);
    line.addEventListener('dragend', handleDragEnd, false);
});

var lineNums = document.querySelectorAll('.line-numbers .line-number');
[].forEach.call(lineNums, function (num, i) {
    num.innerHTML = i + 1;
});


