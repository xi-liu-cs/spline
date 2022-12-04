S.line = (ax,ay,bx,by) =>
{
    S.context.beginPath();
    S.context.moveTo(ax,ay);
    S.context.lineTo(bx,by);
    S.context.stroke();
}

S.rect = (x,y,w,h) =>
{
    S.context.beginPath();
    S.context.rect(x,y,w,h);
    S.context.strokeStyle = 'white';
    S.context.stroke();
    if(S.isSpace)
    {
        S.context.fillStyle = 'gray';
        S.context.fill();
    }
}

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

b_spline_matrix =
[
    -1 / 6, 1 / 2, -1 / 2, 1 / 6,
    1 / 2, -1, 0, 2 / 3,
    -1 / 2, 1 / 2, 1 / 2, 1 / 6,
    1 / 6, 0, 0, 0,
];

S.spline = n =>
{
    let c = S.context,

    px = matrixTransform(catmull_rom_matrix, [S.keys[clamp(n)].x, S.keys[clamp(n + 1)].x, S.keys[clamp(n + 2)].x, S.keys[clamp(n + 3)].x]),
    py = matrixTransform(catmull_rom_matrix, [S.keys[clamp(n)].y, S.keys[clamp(n + 1)].y, S.keys[clamp(n + 2)].y, S.keys[clamp(n + 3)].y]),
    pz = matrixTransform(catmull_rom_matrix, [S.keys[clamp(n)].z, S.keys[clamp(n + 1)].z, S.keys[clamp(n + 2)].z, S.keys[clamp(n + 3)].z]),
    
    clamp = n => Math.max(0, Math.min(S.keys.length - 1, n));
    
    function xr(x, z) /* x rotate */
    {
        let canvas_size = 755;
        x -= canvas_size / 2;
        x = Math.cos(time) * x + Math.sin(time) * z;
        x += canvas_size / 2;
        return x;
    }

    c.moveTo(S.keys[clamp(n + 1)].x, S.keys[clamp(n + 1)].y);

    let loop = 50;
    for(let i = 0; i <= loop; ++i)
    {
        let t = i / loop,
        x = t * (t * (t * px[0] + px[1]) + px[2]) + px[3], /* t ^ 3 * px[0] + t ^ 2 * px[1] + t * px[2] + px[3] */
        y = t * (t * (t * py[0] + py[1]) + py[2]) + py[3],
        z = t * (t * (t * pz[0] + pz[1]) + pz[2]) + pz[3];
        c.lineTo(x, y);
    }
}

function eval_cubic_spline(spline_matrix, p, t) /* p = point */
{
    function spline_value(p)
    {
        let c = matrixTransform(spline_matrix, p);
        return t * (t * (t * c[0] + c[1]) + c[2]) + c[3];
    }
    
    if(Number.isFinite(p[0]))
        return spline_value(p);

    let value = {};
    for(let key in p[0])
        value[key] = spline_value([p[0][key], p[1][key], p[2][key], p[3][key]]); /* a.x, b.x, c.x, d.x */
    
    return value;
}

S.catmull_rom_function = (keys, n, t) =>
{
    let clamp = n => Math.max(0, Math.min(keys.length - 1, n)),
    a = keys[clamp(n - 1)],
    b = keys[clamp(n)],
    c = keys[clamp(n + 1)],
    d = keys[clamp(n + 2)];
    return eval_cubic_spline(catmull_rom_matrix, [a, b, c, d], t);
}

S.b_spline_function = (keys, n, t) =>
{
    let clamp = n => Math.max(0, Math.min(keys.length - 1, n)),
    a = keys[clamp(n - 1)],
    b = keys[clamp(n)],
    c = keys[clamp(n + 1)],
    d = keys[clamp(n + 2)];
    return eval_cubic_spline(b_spline_matrix, [a, b, c, d], t);
}

S.eval_spline = (keys, f, spline_function) => /* f = fraction */
{
    let segment = Math.max(0, Math.min(.999, f)) * (keys.length - 1),
    n = segment >> 0,
    t = segment % 1;
    return spline_function(keys, n, t);
}