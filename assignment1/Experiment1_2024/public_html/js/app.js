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
    gl.useProgram(program1);
    
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
        ...bottomHandleCurveVertices,
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

    const topCurveVerticesTriangles = earClippingTriangulation(topCurveVertices);
    const rectangleVerticesTriangles = earClippingTriangulation(rectangleVertices);
    const fabricCurvesCombinedVerticesTriangles = earClippingTriangulation(fabricCurvesCombinedVertices);
    const handleVerticesCombinedTriangles = earClippingTriangulation(handleVerticesCombined);

    const rectangleBuffer = initBuffer(gl, rectangleVerticesTriangles);
    const topCurveBuffer = initBuffer(gl, topCurveVerticesTriangles);
    const handleVerticesCombinedBuffer = initBuffer(gl, handleVerticesCombinedTriangles);
    const fabricBuffer = initBuffer(gl, fabricCurvesCombinedVerticesTriangles);

    const positionAttributeLocation = gl.getAttribLocation(program1, "aPosition");
    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, rectangleVerticesTriangles.length / 2);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, topCurveBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, topCurveVerticesTriangles.length / 2);

    gl.bindBuffer(gl.ARRAY_BUFFER, handleVerticesCombinedBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, handleVerticesCombinedTriangles.length / 2);
    
    gl.useProgram(program2);
    
    const positionAttributeLocation_ = gl.getAttribLocation(program2, "aPosition");
    gl.enableVertexAttribArray(positionAttributeLocation_);

    gl.bindBuffer(gl.ARRAY_BUFFER, fabricBuffer);
    gl.vertexAttribPointer(positionAttributeLocation_, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, fabricCurvesCombinedVerticesTriangles.length / 2);
}