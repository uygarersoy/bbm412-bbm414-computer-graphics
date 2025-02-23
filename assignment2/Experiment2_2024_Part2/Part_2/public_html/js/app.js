"use strict";
/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

main();

function main() {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("Webgl2 is not supported!");
        return;
    }
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    const program1 = initProgram(gl, vsSource, fsSourceRed);
    const program2 = initProgram(gl, vsSource, fsSourceYellow);
    
    const rectangleVertices = new Float32Array([
        0.02, 0.6,
        -0.02, 0.6,
        -0.02, -0.3,
        0.02, -0.3
    ]);
    
    const topCurveVertices = generateBezierPoints(
        { x: 0.02, y: 0.6 },
        { x: 0.0, y: 0.65 },
        { x: -0.02, y: 0.6 }
    );
    
    const bottomHandleCurveVertices = generateBezierPoints(
        { x: -0.3, y: -0.3 },
        { x: -0.1, y: -0.55 },
        { x: 0.02, y: -0.3 }
    );

    const upperHandleCurveVertices = generateBezierPoints(
        { x: -0.02, y: -0.3 },
        { x: -0.05, y: -0.4 },
        { x: -0.25, y: -0.3 }
    );

    const handleVerticesCombined = [
        ...upperHandleCurveVertices,
        ...bottomHandleCurveVertices
    ];
    
    const topFabricCurve = generateBezierPoints(
        { x: 0.7, y: 0.25 },
        { x: 0.0, y: 0.85 },
        { x: -0.7, y: 0.25 }
    );

    const smallContinuousCurves = createSmallSetOfCurves();
    const fabricCurvesCombinedVertices = [
        ...smallContinuousCurves,
        ...topFabricCurve
    ];
    
    const rectangleTriangles = earClippingTriangulation(rectangleVertices);
    const topCurveVerticesTriangles = earClippingTriangulation(topCurveVertices);
    const handleVerticesCombinedTriangles = earClippingTriangulation(handleVerticesCombined);
    const fabricCurvesCombinedVerticesTriangles = earClippingTriangulation(fabricCurvesCombinedVertices);

    const rectangleBuffer = initBuffer(gl, rectangleTriangles);
    const topCurveBuffer = initBuffer(gl, topCurveVerticesTriangles);
    const handleVerticesCombinedBuffer = initBuffer(gl, handleVerticesCombinedTriangles);
    const fabricBuffer = initBuffer(gl, fabricCurvesCombinedVerticesTriangles);
    
    const umbrellaParts = [
        { buffer: rectangleBuffer, program: program1, count: rectangleTriangles.length / 2},
        { buffer: topCurveBuffer, program: program1, count: topCurveVerticesTriangles.length / 2},
        { buffer: handleVerticesCombinedBuffer, program: program1, count: handleVerticesCombinedTriangles.length / 2},
        { buffer: fabricBuffer, program: program2, count: fabricCurvesCombinedVerticesTriangles.length / 2}
    ];
    
    let rotationAngle = 0;
    const centerPoint = { x: 0.0, y: 0.15 };
    let rotationEnabled = false;
    let lastMouseX = null;
    let fabricColor = [253.0/255.0, 185.0/255.0, 18.0/255.0, 1.0];
    let colorFlag = false;
    
    
    window.addEventListener("keydown", (event) => {
       if (event.key === "r") {
           rotationEnabled = false;
           rotationAngle = 0;
           lastMouseX = null;
           colorFlag = false;
       } else if (event.key === "m") {
           rotationEnabled = true;
       } else if (event.key === "c") {
           colorFlag = true;;
           rotationEnabled = true;
       }
       
    });
    
    canvas.addEventListener("mousemove", (event) =>{
        if (rotationEnabled) {
            const canvasRectangle = canvas.getBoundingClientRect();
            const mouseX = event.clientX - canvasRectangle.left;
            
            if (lastMouseX !== null) {
                const deltaX = - mouseX + lastMouseX;
                const speed = Math.abs(deltaX) * 0.01;
                rotationAngle += deltaX > 0 ? speed : -speed;
            }
            lastMouseX = mouseX;
        }
    });
    
    
    function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (colorFlag) {
            fabricColor = [Math.random(), Math.random(), Math.random(), 1.0];
        } else {
            fabricColor = [253.0/255.0, 185.0/255.0, 18.0/255.0, 1.0];
        }
        umbrellaParts.forEach( part => {
            gl.useProgram(part.program);    
            const cos = Math.cos(rotationAngle);
            const sin = Math.sin(rotationAngle);

            const rotationLoc = gl.getUniformLocation(part.program, "uRotation");
            const translationLoc = gl.getUniformLocation(part.program, "uTranslation");
               
            if (part.program === program2) {
                const fabricColorLoc = gl.getUniformLocation(part.program, "uColor");
                gl.uniform4fv(fabricColorLoc, fabricColor);
            }
               
            gl.uniform2f(rotationLoc, sin, cos);
            gl.uniform2f(translationLoc, centerPoint.x, centerPoint.y);

            const positionLoc = gl.getAttribLocation(part.program, "aPosition");
            gl.enableVertexAttribArray(positionLoc);
            gl.bindBuffer(gl.ARRAY_BUFFER, part.buffer);
            gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, part.count);
        });
        
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}