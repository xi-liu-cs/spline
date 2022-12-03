rooms.spline = function() {

lib2D();

description = 'Simple example of<br>interactive 2D.';

code = {
init: `
    S.x = 400;
    S.y = 400;

    S.keys = 
    [
        {x: 100, y: 100},
        {x: 200, y: 100},
        {x: 100, y: 200},
        {x: 200, y: 200},
    ];
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

    S.spline = n =>
    {
        let bezier_matrix =
        [
            -1, 3, -3, 1,
            3, -6, 3, 0,
            -3, 3, 0, 0,
            1, 0, 0, 0,
        ],

        hermite_matrix =
        [
            2, -3, 0, 1,
            -2, 3, 0, 0,
            1, -2, 1, 0,
            1, -1, 0, 0,
        ],

        catmull_rom_matrix =
        [
            -1 / 2, 1, - 1 / 2, 0,
            3 / 2, - 5 / 2, 0, 1,
            -3 / 2, 2, 1 / 2, 0,
            1 / 2, - 1 / 2, 0, 0,
        ],

        c = S.context,
        n = 50,
        mix = (a, b, t) => a + t * (b - a),
        /* px = matrixTransform(bezier_matrix, [ax, bx, cx, dx]),
        py = matrixTransform(bezier_matrix, [ay, by, cy, dy]); 

        px = matrixTransform(bezier_matrix, [ax, dx, bx - ax, dx - cx]),
        py = matrixTransform(bezier_matrix, [ay, dy, by - ay, dy - cy]); */

        px = matrixTransform(catmull_rom_matrix, [ax, bx, cx, dx]),
        py = matrixTransform(catmull_rom_matrix, [ay, by, cy, dy]); 

        c.moveTo(bx, by);

        for(let i = 0; i <= n; ++i)
        {
            let t = i / n,
            x = t * (t * (t * px[0] + px[1]) + px[2]) + px[3], /* t ^ 3 * px[0] + t ^ 2 * px[1] + t * px[2] + px[3] */
            y = t * (t * (t * py[0] + py[1]) + py[2]) + py[3];
            c.lineTo(x, y);
        }
    }
`,
render: `
    let c = S.context;
    c.lineWidth = 10;
    c.lineCap = 'round'; 
    S.rect(S.x-1,S.y-1, 2,2);
    c.beginPath();

    /* c.moveTo(100,100);
    c.bezierCurveTo(S.x,S.y, 100,300, 200,300); */

    console.log(32);
    S.spline(0);
    
    c.stroke();
    c.lineWidth = 1;
    S.line(100,100, S.x,S.y);
`,
events: `
    onDrag = (x,y) => {
        S.x = x;
        S.y = y;
    }
    onKeyPress = key => S.isSpace = key == 32;
    onKeyRelease = key => S.isSpace = false;
`
};

}