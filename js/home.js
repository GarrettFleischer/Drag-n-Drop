/**
 * Created by Garrett on 4/4/2017.
 */

function Enumify(obj) {
    Object.keys(obj).forEach(function (key, i) {
        if(obj[key] === -1)
            obj[key] = i;
    });
    Object.freeze(obj);
}

var SrcType = {Piece: -1, LinePiece: -1};
Enumify(SrcType);

var EmptyType = {Front: -1, Back: -1, Child: -1};
Enumify(EmptyType);

var LangType = {All: -1, Statements: -1, Statement: -1, Expr: -1, Else: -1, VarRef: -1, TypeName: -1, Assignment: -1};
Enumify(LangType);

var PieceType = {
    TypeName: -1,
    Variable: -1, String: -1,
    If: -1, ElseIf: -1, Else: -1, While: -1, For: -1,
    Equal: -1, Equals: -1, Greater: -1, Less: -1, GreaterEq: -1, LessEq: -1, Plus: -1, PlusEq: -1,
    Minus: -1, MinusEq: -1, Times: -1, TimesEq: -1, Div: -1, DivEq: -1, Percent: -1, PercentEq: -1,
    Not: -1, NotEq: -1, Brackets: -1, Curlies: -1, Parens: -1, Dot: -1, SemiColon: -1, New: -1
};
Enumify(PieceType);;

var ContainerType = {Types: -1, Variables: -1, Statements: -1, Operators: -1, Functions: -1};
Enumify(ContainerType);

var DifficultyType = {Easy: 0, Medium: 1, Hard: 2};
Enumify(DifficultyType);

var dragSrcEl = null;
var dragSrcType = SrcType.Piece;
var difficulty = DifficultyType.Easy;

function initListeners() {
    var lines = $('#lines');
    var pieces = $('#pieces');

    pieces.on('dragstart', '.piece', handleDragStartPiece);
    lines.on('dragstart', '.line-piece-wrapper', handleDragStartLinePiece);
    lines.on('dragenter', '.line,.empty-piece', handleDragEnter);
    lines.on('dragover', '.line,.empty-piece', handleDragOver);
    lines.on('dragleave', '.line,.empty-piece', handleDragLeave);
    lines.on('drop', '.line,.empty-piece', handleDrop);
    lines.on('dragend', '.line,.empty-piece,.line-piece-wrapper', handleDragEnd);
}

function initLineNumbers() {
    var nums = $('.line-number');
    nums.each(function (i) {
        $(this).html(i + 1);
    });
}

function initPieceTypes(callback) {
    // TODO grab data from server
    PieceType = {
        TypeName: -1,
        Variable: -1, String: -1,
        If: -1, ElseIf: -1, Else: -1, While: -1, For: -1,
        Equal: -1, Equals: -1, Greater: -1, Less: -1, GreaterEq: -1, LessEq: -1, Plus: -1, PlusEq: -1,
        Minus: -1, MinusEq: -1, Times: -1, TimesEq: -1, Div: -1, DivEq: -1, Percent: -1, PercentEq: -1,
        Not: -1, NotEq: -1, Brackets: -1, Curlies: -1, Parens: -1, Dot: -1, SemiColon: -1, New: -1
    };
    Enumify(PieceType);

    if(callback !== undefined)
        callback();
}

// /**
//  *
//  * @param context CtxType
//  * @param from LangType
//  * @param to LangType
//  * @returns {boolean}
//  */
// function canConvert(context, from, to) {
//     switch (from)
//     {
//         case LangType.All:
//             return true;
//         case LangType.Statement:
//             return to === LangType.Statements;
//         case LangType.VarRef:
//             if(context === CtxType.VarRefAfter)
//                 return to === LangType.Expr || to === LangType.Assignment;
//             else
//                 return to === LangType.Expr;
//         default:
//             return from === to;
//     }
// }

function makeEmptyPiece(emptyType, acceptedTypes) {
    var piece = $('<span class="line-piece empty-piece"></span>');

    piece.data('emptyType', emptyType);
    piece.data('acceptedTypes', acceptedTypes);

    return piece;
}

function makePieceWrapper(type) {
    var wrapper = $('<div class="line-piece-wrapper"></div>');
    wrapper.data('type', type);
    return wrapper;
}

function makeText(text) {
    return $('<span class="line-piece">' + text + '</span>');
}

function makeNewLine() {
    return $('<div class="clearFix"></div>');
}

function addCurly(parent, curly) {
    parent.append(makeNewLine());
    parent.append(makeText(curly));
    parent.append(makeNewLine())
}

function makeIfStatement() {
    var piece = makePieceWrapper(LangType.Statement);

    piece.append(makeText('if ('));
    piece.append(makeEmptyPiece(EmptyType.Child, [LangType.Expr]));
    piece.append(makeText(')'));
    addCurly(piece, '{');
    piece.append(makeEmptyPiece(EmptyType.Child, [LangType.Statements]));
    addCurly(piece, '}');
    piece.appendChild(makeEmptyPiece(EmptyType.Back, [LangType.Else]));

    return piece;
}

function makeBinary(op) {
    var piece = makePieceWrapper(LangType.Expr);

    piece.append(makeEmptyPiece(EmptyType.Child, [LangType.Expr]));
    piece.append(makeText(op));
    piece.append(makeEmptyPiece(EmptyType.Child, [LangType.Expr]));

    return piece;
}

function makeAssignment() {
    var piece = makePieceWrapper(LangType.Statement);

    piece.append(makeEmptyPiece(EmptyType.Child, [LangType.VarRef]));
    piece.append(makeText('='));
    piece.append(makeEmptyPiece(EmptyType.Child, [LangType.Expr]));

    return piece;
}

function makeVariable(name) {
    var piece = makePieceWrapper(LangType.VarRef);

    piece.append(makeEmptyPiece(EmptyType.Front, [LangType.TypeName]));
    piece.append(makeText(name));

    return piece;
}

function makePiece(type, text) {
    switch (type)
    {

    }
}

// // TODO add blank pieces in between for placing new pieces
// function parsePieces(text) {
//     var words = text.split(' ');
//     var pieceWrapper = document.createElement('div');
//     pieceWrapper.classList.add('line-piece-wrapper');
//     hidden.appendChild(pieceWrapper);
//
//     var isNewLine = false;
//
//     pieceWrapper.appendChild(makeEmptyPiece(EmptyType.Front));
//     for (var i = 0; i < words.length; ++i) {
//         var piece = null;
//         isNewLine = false;
//         switch (words[i]) {
//             case '{':
//             case '}':
//                 piece = document.createElement('div');
//                 piece.innerHTML = words[i];
//                 isNewLine = true;
//                 break;
//
//             case '...':
//                 piece = makeEmptyPiece(EmptyType.Child);
//                 break;
//
//             default:
//                 piece = document.createElement('span');
//                 piece.innerHTML = words[i];
//                 break;
//         }
//
//         if (piece) {
//             if(isNewLine) pieceWrapper.appendChild(makeNewLine());
//             piece.classList.add('line-piece');
//             pieceWrapper.appendChild(piece);
//             if(isNewLine) pieceWrapper.appendChild(makeNewLine());
//         }
//     }
//     if(!isNewLine)
//         pieceWrapper.appendChild(makeEmptyPiece(EmptyType.Back));
//     else
//         pieceWrapper.appendChild(makeEmptyPiece(EmptyType.Child));
//
//     return pieceWrapper;
// }

/**
 * @param piece the piece type that must be accepted
 * @param difficulty
 */
function showEmptyPieces(piece, difficulty) {
    var emptyPieces = $('.line-piece-wrapper .empty-piece');
    emptyPieces.forEach(function (empty) {
        if(difficulty === DifficultyType.Medium || empty.data('acceptedTypes').contains(piece.data('type')))
            empty.addClass('active');
    });
}

function hideEmptyPieces() {
    var pieces = $('.line-piece-wrapper .empty-piece');
    pieces.forEach(function (piece) {
        piece.removeClass('active');
    });
}

function handleDragStart(ev, el) {
    if(ev.stopPropagation) ev.stopPropagation();
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/html', el.innerHTML); // for FireFox to register the move

    dragSrcEl = el;
    dragSrcEl.style.opacity = '0.4';
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
        if (!this.childElementCount && $(dragSrcEl).data('pieceType') === LangType.Statement) {
            switch (dragSrcType) {
                case SrcType.Piece:
                    var pieces = $(dragSrcEl).clone()
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
    var lines = $('.line');
    lines.forEach(function (line) {
        line.classList.remove('over');
    });
    hideEmptyPieces();
}

// var pieces = document.querySelectorAll('.piece');
// [].forEach.call(pieces, function (piece) {
//     piece.addEventListener('dragstart', handleDragStartPiece, false);
//     piece.addEventListener('dragend', handleDragEnd, false);
// });



// var lineNums = document.querySelectorAll('.line-numbers .line-number');
// [].forEach.call(lineNums, function (num, i) {
//     num.innerHTML = i + 1;
// });


