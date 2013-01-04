// add
// subtract
// multiply
// divide
// modulo
// equals
var emoji = {
    0: '',
    1: '',
    2: '',
    crash: '',
};

paper.install(window);
window.onload = function() {
    paper.setup('canvas');
    var canvasSize = new Size(465, 465);

    var phaseRectangle = new Path.Rectangle([0, 0], [canvasSize.width, canvasSize.height]);
    phaseRectangle.strokeWidth = 20;
    phaseRectangle.strokeColor = '#FFFFFF';

    var musicPhase = 0.43;

    view.onFrame = function(e) {
    	phaseRectangle.strokeColor.blue = Math.abs((e.time / musicPhase) % 1 - 0.5) * 2;
    	phaseRectangle.strokeColor.green = Math.abs((e.time / musicPhase) % 1 - 0.5) + 0.5;
    };	
};
