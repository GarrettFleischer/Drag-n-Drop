/**
 * Created by Garrett on 4/4/2017.
 */

var SrcType = {Piece: 0, LinePiece: 1};
Object.freeze(SrcType);
var EmptyType = {Front: 0, Back: 1, Child: 2};
Object.freeze(EmptyType);
var LangType = {All: 0, Statements: 1, Statement: 2, Expr: 3, Else: 4, VarRef: 5};
Object.freeze(LangType);

var dragSrcEl = null;
var dragSrcType = SrcType.Piece;

function initListeners() {
    var lines = $('#lines');
    lines.on('dragstart', '.line-piece-wrapper', handleDragStartLinePiece);

    lines.on('dragenter', '.line,.empty-piece', handleDragEnter);
    lines.on('dragover', '.line,.empty-piece', handleDragOver);
    lines.on('dragleave', '.line,.empty-piece', handleDragLeave);
    lines.on('drop', '.line,.empty-piece', handleDrop);
    lines.on('dragend', '.line,.empty-piece,.line-piece-wrapper', handleDragEnd);
}

function makeEmptyPiece(emptyType, acceptedType) {
    acceptedType = acceptedType || LangType.All;

    var piece = $('<span></span>');
    piece.addClass('line-piece');
    piece.addClass('empty-piece');

    piece.data('acceptedType', acceptedType);
    if(emptyType === EmptyType.Front)
        piece.addClass('front');
    else if(emptyType === EmptyType.Back)
        piece.addClass('back');
    else
        piece.addClass('child');

    return piece;
}

function makeText(text) {
    var piece = document.createElement('span');
    piece.innerHTML = text;

    return piece;
}

function addCurly(parent, curly) {
    parent.append(makeNewLine());
    parent.append(makeText(curly));
    parent.append(makeNewLine())
}

function makeIfStatement() {
    var piece = document.createElement('div');

    piece.append(makeEmptyPiece(EmptyType.Front));
    piece.append(makeText('if ('));
    piece.append(makeEmptyPiece(EmptyType.Child, LangType.Expr));
    piece.append(makeText(')'));
    addCurly(piece, '{');
    piece.append(makeEmptyPiece(EmptyType.Child, LangType.Statements));
    addCurly(piece, '}');
    piece.appendChild(makeEmptyPiece(EmptyType.Back, LangType.Else));

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
    var pieceWrapper = document.createElement('div');
    pieceWrapper.classList.add('line-piece-wrapper');
    hidden.appendChild(pieceWrapper);
    makeDraggable(pieceWrapper);

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
function handleDrop(e) {
    if(e.stopPropagation) e.stopPropagation();

    if(this.hasClass('line')) {
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
    } else if(this.hasClass('empty-piece')){
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

    return false;
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



var lineNums = document.querySelectorAll('.line-numbers .line-number');
[].forEach.call(lineNums, function (num, i) {
    num.innerHTML = i + 1;
});


