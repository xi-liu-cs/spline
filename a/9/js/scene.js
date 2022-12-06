rooms.scene = function() {

lib();

description = `<b>scene</b><br>
spline aircraft<br>
<input type = range id = move_rate> rate<br>
<input type = range id = arm_len value = 28> arm length<br>
<input type = range id = leg_len value = 40> leg length<br>
<input type = range id = finger_number value = 5> finger number<br>
<input type = range id = toe_number value = 5> toe number<br>`;

code = {
'init': 
line(27) + 
`S.n_light = 2;
S.textures = {};

S.drawMesh = (mesh, matrix, materialIndex, textureSrc) =>
{
   let gl = S.gl;
   if(!S.gl.bufferData)
      return;
   S.setUniform('Matrix4fv', 'uMatrix', false, matrix);
   S.setUniform('Matrix4fv', 'uInvMatrix', false, matrixInverse(matrix));
   S.setUniform('Matrix4fv', 'uMaterial', false, S.material[materialIndex]);

   S.setUniform('1i', 'uSampler', 0);
   S.setUniform('1f', 'uTexture', textureSrc ? 1 : 0);

   if(textureSrc)
   {
      if(!S.textures[textureSrc]) /* load texture from server */
      {
         let image = new Image();
         image.onload = function()
         {
            S.textures[this.textureSrc] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, S.textures[this.textureSrc]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
         }
         image.textureSrc = textureSrc;
         image.src = textureSrc;
      }
      else /* texture loaded. can render */
      {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, S.textures[textureSrc]);
      }
   }

   S.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW);
   S.gl.drawArrays(mesh.isTriangles ? S.gl.TRIANGLES
                                    : S.gl.TRIANGLE_STRIP, 0, mesh.length / S.VERTEX_SIZE);
}`,
fragment: `
S.setFragmentShader(\`
const int n_light = \` + S.n_light + \`;
const int nL = \` + S.nL + \`;
const int nM = \` + S.nM + \`;

uniform vec3 uBgColor;
uniform vec3 uLd[nL];
uniform vec3 uLc[nL];
uniform mat4 uMaterial;

uniform sampler2D uSampler; // index of the texture to be sampled
uniform float uTexture;     // are we rendering texture for this object?

varying vec3 vPos, vNor, v_color;
varying vec2 vUV;

uniform vec3 u_light_direct[n_light], u_light_color[n_light];
vec3 sky_color = vec3(0.6, 0.75, 0.95);
uniform mat4 material;
uniform float u_time;
float focal_length = 3.;

vec3 shade(vec3 eye, mat4 material)
{
   vec3 ambient = material[0].rgb,
   diffuse = material[1].rgb,
   specular = material[2].rgb;
   float power = material[2].a;
   vec3 c = mix(ambient, sky_color, .3);
   for(int i = 0; i < n_light; ++i)
   {
      vec3 reflect = 2. * dot(vNor, u_light_direct[i]) * vNor - u_light_direct[i];
      c += u_light_color[i] * .8 * (diffuse * max(0., dot(vNor, u_light_direct[i]))
      + specular * pow(max(0., dot(reflect, eye)), power)); /* + specular * pow(max(0., dot(reflect, eye)), power)) + .5 * pattern(vNor); */
   }
   return c;
}

void main()
{
   vec3 N = normalize(vNor);
   vec3  ambient  = uMaterial[0].rgb;
   vec3  diffuse  = uMaterial[1].rgb;
   vec3  specular = uMaterial[2].rgb;
   float p        = uMaterial[2].a;
   vec3 c = mix(ambient, uBgColor, .3);
   for (int l = 0 ; l < nL ; l++)
   {
      vec3 R = 2. * dot(N, uLd[l]) * N - uLd[l];
      c += uLc[l] * (diffuse * max(0.,dot(N, uLd[l]))
                  + specular * pow(max(0., R.z), p));
   }

   vec4 texture = texture2D(uSampler, vUV);
   vec3 eye = vec3(0., 0., 1.);

   c *= mix(vec3(v_color), texture.rgb, texture.a * uTexture);

   gl_FragColor = vec4(c, 1.);
}
\`);
`,
vertex: `
S.setVertexShader(\`
      attribute vec3 aPos, aNor, a_color;
      attribute vec2 aUV;
      uniform mat4 uMatrix, uInvMatrix, uProject;
      varying vec3 vPos, vNor, v_color;
      varying vec2 vUV;  

      void main() {
         vPos = (uProject * uMatrix * vec4(aPos, 1.)).xyz;
         vNor = (vec4(aNor, 0.) * uInvMatrix).xyz;
         vUV = aUV;
         v_color = a_color;
         gl_Position = vec4(vPos.xy, -.01 * vPos.z, 1.);
      }
\`)
`,
render: `
S.revolutionMesh = S.createRevolutionMesh(16, 32, [
   {z:-1  , r:0  },
   {z:-.99, r:.1 },
   {z:-.7 , r:.5 - .1 * Math.sin(5 * time)},
   {z: .3 , r:.1 },
   {z: .8 , r:.3 },
   {z: 1  , r:0  },
]);

S.revolution_mesh = S.createRevolutionMesh(16, 32, [
   // {z: -.3, r: .2},
   // {z: 1, r: .4},
   // {z: 1, r: .3},
   // {z: 2, r: .1},
   // {z: 1, r: 0},

   // {z:-1  , r:0  },
   // {z:-.99, r:.1 },
   // {z:-.7 , r:.5 },
   // {z: .3 , r:.1 },
   // {z: .8 , r:.3 },
   // {z: 1  , r:0  },

   // {z: 1, r: .5},
   // {z: 1.5, r: .3},
   // {z: 1.7, r: .2},
   // {z: 2, r: .1},
   // {z: 3, r: 0},

   {z: -.3, r: .2},
   {z: 1, r: .4},
   {z: 1, r: .3},
   {z: 2, r: .1},
   {z: 1, r: 0},

   {z:-1  , r:0  },
   {z:-.99, r:.1 },
   {z:-.7 , r:.5 },
   {z: .3 , r:.1 },
   {z: .8 , r:.3 },
   {z: 1  , r:0  },

   {z: 1, r: .4},
   {z: 1.5, r: .2},
   {z: 1.7, r: .1},
   {z: 2, r: .1},
   {z: 3, r: 0},
]);

let extrusionData = {
   radius: 0.1,
   profile: [
      {x:-1 , y:-1 , z: 0},
      {x: 1 , y:-1 , z: 0},
      {x: 1 , y: 1 , z: 0},
      {x:-1 , y: 1 , z: 0},
   ],
   path: [
      {x:-.4, y:-.4, z: 0},
      {x: .4, y:-.4, z: 0},
      {x: .4, y: .4, z: 0},
      {x:-.4, y: .4, z: 0},
   ]
},

extrusion_data = {
   radius: 0.1,
   profile: [
      {x:-1 , y:-1 , z: 0},
      {x: 1 , y:-1 , z: 0},
      {x: 1 , y: 1 , z: 0},
      {x:-1 , y: 1 , z: 0},
   ],
   path: [
      {x: .4, y:-.4, z: 0},
      {x:-.4, y:-.4, z: 0},
      {x:-.4, y: .4, z: 0},
      {x: .4, y: .4, z: 0},
   ]
},

extrusion_data2 = {
   radius: 0.15,
   profile: [
      {x:-.5 , y:-1 , z: 0},
      {x: .5 , y:-1 , z: 0},
      {x: .5 , y: 1 , z: 0},
      {x:-.5 , y: 1 , z: 0},
   ],
   path: [
      {x: 0, y: 0, z: 0},
      {x: 2, y: 0, z: -.3},

      {x: -2, y: 0, z: -.3},
      {x: 0, y: 0, z: 0},
   ]
};

extrusion_data3 = {
   radius: 0.15,
   profile: [
      {x:-.5 , y:-1 , z: 0},
      {x: .5 , y:-1 , z: 0},
      {x: .5 , y: 1 , z: 0},
      {x:-.5 , y: 1 , z: 0},
   ],
   path: [
      {x: 0, y: 0, z: 0},
      {x: 2, y: 0, z: -.3},
   ]
};

S.extrusionMesh = S.createExtrusionMesh(24, 8, extrusionData);

// SET THE PROJECTION MATRIX BASED ON CAMERA FOCAL LENGTH

let fl = 5.0;
S.setUniform('Matrix4fv', 'uProject', false,
   [1,0,0,0, 0,1,0,0, 0,0,1,-1/fl, 0,0,0,1]);

// SPECIFY SCENE LIGHTING

S.nL = 2;
S.setUniform('3fv', 'uLd', [ .57,.57,.57, -.57,-.57,-.57 ]);
S.setUniform('3fv', 'uLc', [ 1,1,1, .5,.3,.1 ]);
S.setUniform('3fv', 'uBgColor', [ .89,.81,.75 ]);

// RENDER THE SCENE

let m = new Matrix();
m.save();
   m.scale(.3);
   m.rotx(Math.PI * Math.sin(time));
   m.roty(Math.PI * Math.cos(time));
   S.drawMesh(S.revolution_mesh, m.get(), 3, 'image/1.png');
   m.save();
      m.translate(0, 0, 1);
      m.save();
         m.scale(.7);
         S.drawMesh(S.extrusionMesh, m.get(), 1, 'image/2.png');
         S.drawMesh(S.createExtrusionMesh(24, 8, extrusion_data), m.get(), 1, 'image/2.png');
      m.restore();
      S.drawMesh(S.createExtrusionMesh(24, 8, extrusion_data2), m.get(), 1, 'image/1.png');
      m.translate(0, 0, -1.5);
      m.scale(.55);
      S.drawMesh(S.createExtrusionMesh(24, 8, extrusion_data2), m.get(), 1, 'image/1.png');
      m.rotz(-Math.PI / 2);
      S.drawMesh(S.createExtrusionMesh(24, 8, extrusion_data3), m.get(), 1, 'image/1.png');
   m.restore();
m.restore();

let m2 = new Matrix();
m2.save();
   m2.translate(.23 * Math.PI * Math.sin(time), .23 * Math.PI * Math.cos(time), 0);
   m2.save();
      m2.scale(.1);
      m2.rotx(Math.PI / 2);
      m2.rotz(Math.PI * .5 * time);
      S.drawMesh(S.sphereMesh, m2.get(), 5, 'image/2.png');
   m2.restore();
m2.restore();

m2.save();
   m2.translate(0, 0, -100);
   S.drawMesh(S.squareMesh, m2.get(), 0, 'image/0.png');
m2.restore();

m2.save();
   m2.translate(0, -1, -100);
   S.drawMesh(S.square_mesh(.01 * time), m2.get(), 5);
m2.restore();

/* human start */
ld0 = normalize([Math.cos(time), Math.sin(time), 1]),
ld1 = normalize([-1, -1, 1]),
ld_data = [];
for(let i = 0; i < 3; ++i)
   ld_data.push(ld0[i]);
for(let i = 0; i < 3; ++i)
   ld_data.push(ld1[i]);
S.setUniform('1f', 'u_time', time);
S.setUniform('3fv', 'u_light_direct', ld_data);
S.setUniform('3fv', 'u_light_color', [1, 1, 1, .5, .3, .1]);
S.setUniform('Matrix4fv', 'u_material', false, S.material.flat());
S.setUniform('Matrix4fv', 'uProject', false,
[1,0,0,0, 0,1,0,0, 0,0,1,-.2, 0,0,0,1]);

let rate = 2 * time * move_rate.value / 100,
t = rate - Math.PI / 2,
arm_length = .1 + .9 * arm_len.value / 100,
leg_length = .1 + .9 * leg_len.value / 100,
n_finger = finger_number.value,
n_toe = toe_number.value;

m.identity();
m.translate(.5, 0, 0);
m.scale(.3);
m.roty(Math.sin(.5 * rate));
m.save();
    m.save(); /* head */
        m.rotx(.1 * Math.cos(t));
        m.translate(0, .73, 0);
        m.rotz(.3 * Math.cos(2 * time));
        m.save();
            m.translate(0, .12, 0);
            m.scale(.1, .14, .1);
            m.save(); /* hair */
                m.translate(0, .5, 0);
                m.scale(.9, .7, .8);
                m.rotx(-Math.PI / 2);
                S.draw_mesh2(S.half_sphere_mesh2, m.get(), S.material[0]);
                m.save(); /* left */
                    m.scale(.5, .65, .7);
                    m.translate(-1.25, -.18, .2);
                    m.rotx(-Math.PI);
                    m.roty(-Math.PI / 2);
                    S.draw_mesh2(S.half_sphere_mesh2, m.get(), S.material[0]);
                m.restore();
                m.save(); /* right */
                    m.scale(.5, .8, .7);
                    m.translate(1.25, -.18, .2);
                    m.rotx(Math.PI);
                    m.roty(Math.PI / 2);
                    S.draw_mesh2(S.half_sphere_mesh2, m.get(), S.material[0]);
                m.restore();
            m.restore();
            m.save(); /* ear */
                m.translate(-1, -.06, 0);
                m.scale(.07, .19, .2);
                m.save();
                    m.translate(0, .22, 0);
                    m.scale(1, .7, 1);
                    S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
                m.restore();
                m.save();
                    m.rotx(Math.PI);
                    S.draw_mesh2(S.half_sphere_mesh, m.get(), S.material[0]);
                m.restore();
                m.translate(0, -.5, 0);
                m.scale(1, .5, .5);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
            m.restore();
            m.save(); /* ear */
                m.translate(1, -.06, 0);
                m.scale(.07, .19, .2);
                m.save();
                    m.translate(0, .22, 0);
                    m.scale(1, .7, 1);
                    S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
                m.restore();
                m.save();
                    m.rotx(Math.PI);
                    S.draw_mesh2(S.half_sphere_mesh, m.get(), S.material[0]);
                m.restore();
                m.translate(0, -.5, 0);
                m.scale(1, .5, .5);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
            m.restore();
            S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
            m.save(); /* eye */
                m.translate(-.5, .26, .8);
                m.scale(.17, .06, .1);
                m.save(); /* eyebrow */
                    m.translate(.2, 2, -.5);
                    m.scale(1.6, .5, 1.4);
                    S.draw_mesh4(octahedron(20, 10), m.get(), S.material[7]);
                    m.translate(.2, 0, 0);
                    m.roty(Math.PI / 3)
                    S.draw_mesh4(octahedron(20, 10), m.get(), S.material[7]);
                m.restore();
                m.save();
                    m.scale(.5, 1, 1);
                    m.translate(-.3, 0, 0);
                    S.draw_mesh2(S.sphere_mesh, m.get(), S.material[7]);
                m.restore();
                m.scale(1.4, 1, 1.4);
                S.draw_mesh4(octahedron(20, 10), m.get(), S.material[6]);
            m.restore();
            m.save(); /* eye */
                m.translate(.5, .26, .8);
                m.scale(.17, .06, .1);
                m.save(); /* eyebrow */
                    m.translate(-.2, 2, -.5);
                    m.scale(1.6, .5, 1.4);
                    S.draw_mesh4(octahedron(20, 10), m.get(), S.material[7]);
                    m.translate(.2, 0, 0);
                    m.roty(Math.PI / 3);
                    S.draw_mesh4(octahedron(20, 10), m.get(), S.material[7]);
                m.restore();
                m.save();
                    m.scale(.5, 1, 1);
                    m.translate(.3, 0, 0);
                    S.draw_mesh2(S.sphere_mesh, m.get(), S.material[7]);
                m.restore();
                m.save();
                    m.scale(1.4, 1, 1.4);
                    S.draw_mesh4(octahedron(20, 10), m.get(), S.material[6]);
                m.restore();
            m.restore();
            m.save(); /* nose */
                m.translate(.6, -.06, 1.2);
                cone3([], 0, S.material[0], m); /* m.scale(.07, .18, .07); S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]); */
            m.restore();
            m.save(); /* mouth */
                m.translate(0, -.4, 1);
                m.scale(.25, .07, .07);
                S.draw_mesh4(octahedron(20, 10), m.get(), S.material[0]); /* S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]); */
            m.restore();
        m.restore();
    m.restore();

    m.rotx(.1 * Math.cos(t));
    for(let i = -1; i <= 1; i += 2)
    {/* arm */
        let t = rate + i * Math.PI / 2;
        m.save();
            m.translate(i * .2, .6 + .03 * Math.cos(t), 0);
            m.rotx(Math.cos(t));
            m.save(); /* joint */
                m.rotx(Math.PI / 2);
                m.scale(.018, arm_length / 11, .018);
                S.draw_mesh2(S.tube_mesh, m.get(), S.material[0]);
                m.scale(1, 1, 2);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
            m.restore();
            m.save(); /* top */
                m.translate(0, -arm_length / 2, 0);
                m.scale(.03, arm_length / 2, .03);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
                S.draw_mesh2(S.tube_mesh, m.get(), S.material[0]);
            m.restore();
            m.translate(0, -arm_length, 0);
            m.rotx(-1 + .7 * Math.sin(t));
            m.save(); /* joint */
                m.rotx(Math.PI / 2);
                m.scale(.018, arm_length / 11, .018);
                S.draw_mesh2(S.tube_mesh, m.get(), S.material[0]);
            m.restore();
            m.save(); /* bottom */
                m.translate(0, -arm_length / 2, 0);
                m.scale(.027, arm_length / 2, .027);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
                S.draw_mesh2(S.tube_mesh, m.get(), S.material[0]);
            m.restore();
            m.save(); /* joint */
                m.rotx(Math.PI / 2);
                m.scale(.018, arm_length / 11, .018);
                S.draw_mesh2(S.tube_mesh, m.get(), S.material[0]);
            m.restore();
            m.translate(0, -arm_length, .03);
            m.save(); /* hand */
                m.translate(0, -arm_length / 10, -.03);
                m.scale(.01, arm_length / 10, .02);
                S.draw_mesh2(S.cube_mesh, m.get(), S.material[1]);
            m.restore();
            for(let j = 0; j < n_finger; ++j)
            {/* finger */
                m.save();
                    m.rotx(j / Math.PI / 2);
                    m.translate(0, -arm_length / 5, 0);
                    m.scale(.01, arm_length / 5, .01);
                    S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
                m.restore();
            }
        m.restore();
    }

    for(let i = -1; i <= 1; i += 2)
    {/* leg */
        let t = rate - i * Math.PI / 2;
        m.save();
            m.translate(i * .1, .1 + .03 * Math.cos(t), 0);
            m.rotx(Math.cos(t));
            m.save(); /* top */
                m.translate(0, -leg_length / 2, 0);
                m.scale(.05, leg_length / 2, .05);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
                m.save();
                    m.scale(.9, 1, .9);
                    S.draw_mesh2(S.tube_mesh, m.get(), S.material[1]);
                m.restore();
            m.restore();
            m.translate(0, -leg_length, 0);
            m.rotx(1 + Math.sin(t));
            m.save(); /* joint */
                m.rotx(Math.PI / 2);
                m.scale(.02, arm_length / 11, .02);
                S.draw_mesh2(S.tube_mesh, m.get(), S.material[1]);
                m.scale(1, 1, 2);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
            m.restore();
            m.save(); /* bottom */
                m.translate(0, -leg_length / 2, 0);
                m.scale(.05, leg_length / 2, .05);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
                m.save();
                    m.scale(.8, .8, .8);
                    S.draw_mesh2(S.tube_mesh, m.get(), S.material[1]);
                m.restore();
            m.restore();
            m.translate(0, -leg_length, 0);
            m.rotx(-Math.PI);
            m.roty(Math.PI / 2);
            m.rotz(Math.PI / 2);
            m.save(); /* foot */
                m.translate(0, -arm_length / 6, 0);
                m.scale(.01, arm_length / 6, .02);
                S.draw_mesh2(S.cube_mesh, m.get(), S.material[1]);
            m.restore();
            m.rotx(-Math.PI / 10);
            for(let j = 0; j < n_toe; ++j)
            {/* toe */
                m.save();
                    m.rotx(j / Math.PI / 2.3);
                    m.translate(0, -arm_length / 5, 0);
                    m.scale(.01, arm_length / 5, .01);
                    S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
                m.restore();
            }
        m.restore();
    }
m.restore();

/* body */
m.save();
    m.rotx(.1 * Math.cos(t));
    m.save(); /* top */
        m.translate(0, .55, 0);
        m.scale(.21, .2, .13);
        m.rotx(Math.PI / 2);
        S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
    m.restore();
    m.rotx(.07 * Math.cos(t));
    m.save();
        m.translate(0, .3, 0);
        m.scale(.15, .3, .11);
        m.rotx(Math.PI / 2);
        S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
    m.restore();
    m.save();
        m.translate(0, .4, 0);
        m.scale(.15, .4, .1);
        m.rotx(Math.PI / 2);
        S.draw_mesh2(S.half_sphere_mesh, m.get(), S.material[0]);
    m.restore();
m.restore();

/* neck */
m.save();
m.rotx(.1 * Math.cos(t));
m.translate(0, .7, 0);
m.scale(.06, .08, .06);
m.rotx(Math.PI / 2);
S.draw_mesh2(S.tube_mesh, m.get(), S.material[1]);
m.restore();
/* human end */
`,
events: `
      ;
`
};

}    