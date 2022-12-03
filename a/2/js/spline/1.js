rooms.spline = function() {

lib2D();

description = 'Simple example of<br>interactive 2D.';

code = {
init: `
    S.x = 400;
    S.y = 400;
`,
assets: `
    S.line = (ax,ay,bx,by) => {
        S.context.beginPath();
        S.context.moveTo(ax,ay);
        S.context.lineTo(bx,by);
        S.context.stroke();
    }
    S.rect = (x,y,w,h) => {
        S.context.beginPath();
        S.context.rect(x,y,w,h);
        S.context.strokeStyle = 'white';
        S.context.stroke();
        if (S.isSpace) {
        S.context.fillStyle = 'gray';
        S.context.fill();
        }
    }
`,
render: `
    let c = S.context;
    c.lineWidth = 10;
    c.lineCap = 'round'; 
    S.rect(S.x-1,S.y-1, 2,2);
    c.beginPath();
    c.moveTo(100,100);
    c.bezierCurveTo(S.x,S.y, 100,300, 200,300);
    c.stroke();
    c.lineWidth = 1;
    S.line(100,100, S.x,S.y);
`,
events: `
    onDrag = (x,y) => {
        S.x = x;
        S.y = y;
    }
    onKeyPress   = key => S.isSpace = key == 32;
    onKeyRelease = key => S.isSpace = false;
`
};

}