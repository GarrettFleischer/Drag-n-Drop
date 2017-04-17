/**
 * Created by Garrett on 4/4/2017.
 */

var SrcType = {Piece: 0, LinePiece: 1};
Object.freeze(SrcType);
var EmptyType = {Front: 0, Back: 1, Child: 2};
Object.freeze(EmptyType);

var dragSrcEl = null;
var dragSrcType = SrcType.Piece;

function makeEmptyPiece(type) {
    var hidden = document.getElementById('hidden');
    var piece = document.createElement('span');
    piece.classList.add('line-piece');
    piece.classList.add('empty-piece');

    if(type === EmptyType.Front)
        piece.classList.add('front');
    else if(type === EmptyType.Back)
        piece.classList.add('back');
    else
        piece.classList.add('child');

    hidden.appendChild(piece);
    piece.addEventListener('dragenter', handleDragEnter, false);
    piece.addEventListener('dragover', handleDragOver, false);
    piece.addEventListener('dragleave', handleDragLeave, false);
    piece.addEventListener('drop', handleDropEmptyPiece, false);
    piece.addEventListener('dragend', handleDragEnd, false);

    return piece;
}

function makeNewLine() {
    var newLine = document.createElement('div');
    newLine.classList.add('clearFix');

    return newLine;
}

// TODO add blank pieces in between for placing new pieces
function parsePieces(text) {
    var words = text.split(' ');
    var hidden = document.getElementById('hidden');
    var pieceWrapper = document.createElement('div');
    pieceWrapper.classList.add('line-piece-wrapper');
    hidden.appendChild(pieceWrapper);
    pieceWrapper.setAttribute('draggable', true);
    pieceWrapper.addEventListener('dragstart', handleDragStartLinePiece, false);
    pieceWrapper.addEventListener('dragend', handleDragEnd, false);


    var isNewLine = false;

    pieceWrapper.appendChild(makeEmptyPiece(EmptyType.Front));
    for (var i = 0; i < words.length; ++i) {
        var piece = null;
        isNewLine = false;
        switch (words[i]) {
            case '{':
            case '}':
                piece = document.createElement('div');
                piece.innerHTML = words[i];
                isNewLine = true;
                break;

            case '...':
                piece = makeEmptyPiece(EmptyType.Child);
                break;

            default:
                piece = document.createElement('span');
                piece.innerHTML = words[i];
                break;
        }

        if (piece) {
            if(isNewLine) pieceWrapper.appendChild(makeNewLine());
            piece.classList.add('line-piece');
            pieceWrapper.appendChild(piece);
            if(isNewLine) pieceWrapper.appendChild(makeNewLine());
        }
    }
    if(!isNewLine)
        pieceWrapper.appendChild(makeEmptyPiece(EmptyType.Back));
    else
        pieceWrapper.appendChild(makeEmptyPiece(EmptyType.Child));

    return pieceWrapper;
}

function showEmptyPieces() {
    var pieces = document.querySelectorAll('.empty-piece');
    [].forEach.call(pieces, function (piece) {
        var isChild = piece.classList.contains('child');
        if(!dragSrcEl.contains(piece)) {
            if(!(isChild && piece.previousSibling.classList.contains('line-piece-wrapper')))
                piece.classList.add('active');
        }
        // var isFront = piece.classList.contains('front');
        // if(!dragSrcEl.contains(piece) &&
        //     ((!isFront && !piece.parentNode.nextSibling) ||
        //     isFront && piece.parentNode.previousSibling !== dragSrcEl)) {
        //     piece.classList.add('active');
        // }
    });
}

function hideEmptyPieces() {
    var pieces = document.querySelectorAll('.empty-piece');
    [].forEach.call(pieces, function (piece) {
        piece.classList.remove('active');
    });
}

function handleDragStart(ev, el) {
    if(ev.stopPropagation) ev.stopPropagation();
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/html', el.innerHTML);

    el.style.opacity = '0.4';
    dragSrcEl = el;
    showEmptyPieces();
}

function handleDragStartPiece(e) {
    dragSrcType = SrcType.Piece;
    handleDragStart(e, this);
}

function handleDragStartLinePiece(e) {
    dragSrcType = SrcType.LinePiece;
    handleDragStart(e, this);
}

function handleDragOver(e) {
    if(e.preventDefault) e.preventDefault();
    if(e.stopPropagation) e.stopPropagation();

    if(!this.classList.contains('line') || !this.childElementCount)
        e.dataTransfer.dropEffect = 'move';

    return false;
}

function handleDragEnter(e) {
    if(e.stopPropagation) e.stopPropagation();
    if(!this.classList.contains('line') || !this.childElementCount)
        this.classList.add('over');
}

function handleDragLeave(e) {
    if(e.stopPropagation) e.stopPropagation();
    this.classList.remove('over');
}

// TODO remove this functionality and have each line be a empty piece
function handleDropLine(e) {
    if(e.stopPropagation) e.stopPropagation();

    if (!this.childElementCount) {
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

    if (!dragSrcEl.contains(this) && !this.contains(dragSrcEl)) {
        var piece = (dragSrcType === SrcType.LinePiece ? dragSrcEl : parsePieces(e.dataTransfer.getData('text/html')));

        if (this.classList.contains('child')) {
            this.parentNode.insertBefore(piece, this);
        } else if(this.classList.contains('front')) {
            this.parentNode.parentNode.insertBefore(piece, this.parentNode);
        } else {
            this.parentNode.parentNode.insertBefore(piece, this.parentNode.nextSibling);
        }
    }
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    [].forEach.call(lines, function (line) {
        line.classList.remove('over');
    });
    hideEmptyPieces();
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


