# spline aircraft

![0](img/0.png)
Xi Liu<br>
This project is done for computer graphics course at New York University, fall 2022, using WebGL.<br>
An aircraft made of meshes such as extrusions and surface of revolutions that are constructed from splines. Many different kinds of splines are created through bezier, hermite, catmull-rom, and b-spline matrices. For the revolution mesh, $z$ and $r$ values are computed through the ```evalCubicSpline()``` function, for the extrusion mesh, $x, y$, and $z$ values are computed through the ```evalCubicSpline()``` function, inside the ```evalCubicSpline()``` function, there is a ```splineValue()``` function that first transforms the matrix by multiplying the ```mat4 splineMatrix``` with the ```vec4 P``` and stores the result in $c$, and then using $c[0 : 4]$ as the coefficients of the returned cubic polynomial value at a point. Can click ```start or stop movement``` button to start or stop the plane's rotation.

![1](img/1.png)
![2](img/2.png)
![3](img/3.png)
![4](img/4.png)
![5](img/5.png)
