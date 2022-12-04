rooms.spline = function() {

lib2D();

description = 'spline';

code = {
init: `
    S.keys = 
    [
        {x: 100, y: 100, z: 100},
        {x: 200, y: 100, z: 0},
        {x: 100, y: 200, z: 0},
        {x: 200, y: 200, z: 0},
    ];
`,
assets: ``,
render: `
    let c = S.context;
    c.lineWidth = 3;
    c.lineCap = 'round';

    for(let i = 0; i < S.keys.length; ++i)
        S.rect(S.keys[i].x - 3, S.keys[i].y - 3, 6, 6);
    
    c.beginPath();

    let step = 1.0 / 100;
    for(let i = 0; i <= 1; i += step)
    {
        let p = S.eval_spline(S.keys, i, S.b_spline_function);
        c.lineTo(p.x, p.y);
    }
    
    c.stroke();
    
    let f = (time / 3) % 1,
    p = S.eval_spline(S.keys, f, S.b_spline_function);
    S.rect(p.x - 15, p.y - 15, 30, 30);
`,
events: `
    onPress = (x, y) =>
    {
        S.n = -1;
        S.drag = false;
        for(let i = 0; i < S.keys.length; ++i) /* if miss all key points, then at end of this loop, S.n = -1, user did not press anything */
            if(S.keys[i].x - 10 <= x && x <= S.keys[i].x + 10 &&
               S.keys[i].y - 10 <= y && y <= S.keys[i].y + 10)
                S.n = i;
    }

    onDrag = (x,y) =>
    {
        S.drag = true;
        if(S.n >= 0) /* user pressed */
        {
            S.keys[S.n].x = x;
            S.keys[S.n].y = y;
        }
    }

    onRelease = (x, y) =>
    {
        if(!S.drag)
            if(S.n >= 0)
                S.keys.splice(S.n, 1);
            else
                S.keys.push({x: x, y: y});
    }

    onKeyPress = key => S.isSpace = key == 32;
    onKeyRelease = key => S.isSpace = false;
`
};

}