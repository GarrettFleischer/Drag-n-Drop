/**
 * Created by Garrett on 4/25/2017.
 */

function initKonva() {
    console.log("konva");
    var container = $('#lines-container');
    var width = container.width();
    var height = container.height();
    var stage = new Konva.Stage({
        container: 'lines-container',
        width: width,
        height: height
    });
    var layer = new Konva.Layer();
    stage.add(layer);
    var tempLayer = new Konva.Layer();
    stage.add(tempLayer);
    var text = new Konva.Text({
        fill : 'black'
    });
    layer.add(text);
    var star;
    for (var i = 0; i < 10; i++) {
        star = new Konva.Star({
            x : stage.width() * Math.random(),
            y : stage.height() * Math.random(),
            fill : "blue",
            numPoints :10,
            innerRadius : 20,
            outerRadius : 25,
            draggable: true,
            name : 'star ' + i,
            shadowOffsetX : 5,
            shadowOffsetY : 5
        });
        layer.add(star);
    }

    layer.draw();
    stage.on("dragstart", function(e){
        e.target.moveTo(tempLayer);
        text.text('Moving ' + e.target.name());
        layer.draw();
    });

    function getShapeUnder(shape) {

    }

    var previousShape;
    stage.on("dragmove", function(evt){
        var pos = stage.getPointerPosition();
        var shape = layer.getIntersection(pos);
        if (previousShape && shape) {
            if (previousShape !== shape) {
                // leave from old targer
                previousShape.fire('dragleave', {
                    type : 'dragleave',
                    target : previousShape,
                    evt : evt.evt
                }, true);
                // enter new targer
                shape.fire('dragenter', {
                    type : 'dragenter',
                    target : shape,
                    evt : evt.evt
                }, true);
                previousShape = shape;
            } else {
                previousShape.fire('dragover', {
                    type : 'dragover',
                    target : previousShape,
                    evt : evt.evt
                }, true);
            }
        } else if (!previousShape && shape) {
            previousShape = shape;
            shape.fire('dragenter', {
                type : 'dragenter',
                target : shape,
                evt : evt.evt
            }, true);
        } else if (previousShape && !shape) {
            previousShape.fire('dragleave', {
                type : 'dragleave',
                target : previousShape,
                evt : evt.evt
            }, true);
            previousShape = undefined;
        }
    });

    stage.on("dragend", function(e){
        var pos = stage.getPointerPosition();
        var shape = layer.getIntersection(pos);
        if (shape) {
            previousShape.fire('drop', {
                type : 'drop',
                target : previousShape,
                evt : e.evt
            }, true);
        }
        previousShape = undefined;
        e.target.moveTo(layer);
        layer.draw();
        tempLayer.draw();
    });

    stage.on("dragenter", function(e){
        e.target.fill('green');
        text.text('dragenter ' + e.target.name());
        layer.draw();
    });

    stage.on("dragleave", function(e){
        e.target.fill('blue');
        text.text('dragleave ' + e.target.name());
        layer.draw();
    });

    stage.on("dragover", function(e){
        text.text('dragover ' + e.target.name());
        layer.draw();
    });

    stage.on("drop", function(e){
        e.target.fill('red');
        text.text('drop ' + e.target.name());
        layer.draw();
    });
}
