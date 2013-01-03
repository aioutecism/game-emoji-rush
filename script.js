var size = {
	w: 465,
	h: 465
};

paper.install(window);
window.onload = function() {
    paper.setup('canvas');

    var path = new Path.Rectangle([0, 0], [size.w, size.h]);
    path.strokeWidth = 20;
    path.strokeColor = '#FFFFFF';

    var musicPhase = 0.43;

    view.onFrame = function(e) {
    	path.strokeColor.blue = Math.abs((e.time / musicPhase) % 1 - 0.5) * 2;
    	path.strokeColor.green = Math.abs((e.time / musicPhase) % 1 - 0.5) + 0.5;
    };	
}