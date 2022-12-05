rooms.scene = function() {

lib3D2();

description = `<b>scene</b>`;

code = {
'init': 
line(27) + 
`S.textures = {};

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
      if(!S.textures[textureSrc]) // need to load the texture from the server
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
      else // texture has loaded. ok to render
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
      const int nL = \` + S.nL + \`;
      const int nM = \` + S.nM + \`;
      uniform vec3 uBgColor;
      uniform vec3 uLd[nL];
      uniform vec3 uLc[nL];
      uniform mat4 uMaterial;

      uniform sampler2D uSampler; // index of the texture to be sampled
      uniform float uTexture;     // are we rendering texture for this object?

      varying vec3 vPos, vNor;
      varying vec2 vUV;

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
         c *= mix(vec3(1.), texture.rgb, texture.a * uTexture);

         gl_FragColor = vec4(c, 1.);
      }
\`);
`,
vertex: `
S.setVertexShader(\`
      attribute vec3 aPos, aNor;
      attribute vec2 aUV;
      uniform mat4 uMatrix, uInvMatrix, uProject;
      varying vec3 vPos, vNor;
      varying vec2 vUV;  

      void main() {
         vPos = (uProject * uMatrix * vec4(aPos, 1.)).xyz;
         vNor = (vec4(aNor, 0.) * uInvMatrix).xyz;
         vUV = aUV;
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

      let extrusionData = {
         radius: 0.1,
         profile: [
            {x:-1 , y:-1 , z: 0},
            {x: 1 , y:-1 , z: 0},
            {x: 1 , y: 1 , z: 0},
            {x:-1 , y: 1 , z: 0},
         ],
         path: [
            {x:-.5, y:-.5, z: 0},
            {x: .5, y:-.5, z: 0},
            {x: .5, y: .5, z: 0},
            {x:-.5, y: .5, z: 0},
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
         m.rotx(-Math.PI/5 * Math.sin(time));
         m.roty(Math.PI * Math.cos(time));
         m.rotz(Math.PI/5 * Math.cos(time));
         S.drawMesh(S.revolutionMesh, m.get(), 0, 'image/brick.png');
         S.drawMesh(S.extrusionMesh, m.get(), 1, 'image/0.png');
      m.restore(); 

      let m2 = new Matrix();
      m2.save();
         m2.translate(-.7, .7, 0);
         m2.scale(.05);
         m2.rotx(Math.PI / 2);
         S.drawMesh(S.sphereMesh, m2.get(), 0, 'image/brick.png');
      m2.restore();
`,
events: `
      ;
`
};

}    