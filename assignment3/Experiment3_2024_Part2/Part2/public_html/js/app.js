/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


let currentColor = "#000000";
let scale = 1;
let closed = false;
let fill = false;
let translation = { x: 0, y: 0};
let theta = 0;
let hasFilled = false;
let canTransform = false;
const canvas = document.getElementById("glCanvas"); 
const gl = canvas.getContext("webgl2");


document.addEventListener("DOMContentLoaded", () => {
    const colorPicker = document.getElementById("colorPicker");
    colorPicker.addEventListener("input", () => {
        currentColor = colorPicker.value;
    });
    
    let vertices = [];
    let isDrawing = false;
    let filledTriangles = [];
    
    function hexToRgb(hex) {
        return [
            parseInt(hex.slice(1, 3), 16) / 255,
            parseInt(hex.slice(3, 5), 16) / 255,
            parseInt(hex.slice(5, 7), 16) / 255,
            1.0
        ];
    }
    function drawPolygon(gl, vertices) {
        gl.clear(gl.COLOR_BUFFER_BIT);

        if (vertices.length < 2) {
            return;
        }

        if (closed && vertices.length > 2 && isDrawing) {
            vertices.push(vertices[0]);
            isDrawing = false;
        }
        const vertexArray = [];
        for (let i = 0; i < vertices.length; i++) {
            vertexArray.push(vertices[i].x, vertices[i].y);
        }
        const program = initProgram(gl, vsSource, fsSource);
        gl.useProgram(program);

        const buffer = initBuffer(gl, vertexArray);

        const positionLocation = gl.getAttribLocation(program, "aPosition");
        const translationLocation = gl.getUniformLocation(program, "uTranslation");
        const thetaLocation = gl.getUniformLocation(program, "theta");
        const scaleLocation = gl.getUniformLocation(program, "uScale");

        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(translationLocation, translation.x, translation.y);
        gl.uniform1f(thetaLocation, theta);
        gl.uniform1f(scaleLocation, scale);
        const colorLocation = gl.getUniformLocation(program, "uColor");
        const color = hexToRgb(currentColor);
        gl.uniform4fv(colorLocation, color);

        if (filledTriangles.length > 0) {
            const filledBuffer = initBuffer(gl, filledTriangles);
            gl.bindBuffer(gl.ARRAY_BUFFER, filledBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, filledTriangles.length / 2);
        } else {
            for (let i = 0; i < vertices.length - 1; i++) {
                gl.drawArrays(gl.LINES, i, 2);
            }
        }
    }    
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    document.getElementById("Draw").addEventListener("click", () => {
        if (vertices.length > 0) {
            return;
        }
        canTransform = true;    
        isDrawing = true;
        canvas.style.cursor = "crosshair";
        vertices = []; 
        gl.clear(gl.COLOR_BUFFER_BIT);
    });
    
    canvas.addEventListener("click", (event) => {
        if (!isDrawing){
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / canvas.width * 2 - 1;
        const y = (rect.bottom - event.clientY) / canvas.height * 2 - 1;
        vertices.push({x, y});
        drawPolygon(gl, vertices, closed);
    });
    
    document.getElementById("Clear").addEventListener("click", () => {
        isDrawing = false;
        canTransform = false;
        canvas.style.cursor = "default";
        vertices = [];
        filledTriangles = [];
        closed = false;
        translation = { x: 0.0, y: 0.0 };
        theta = 0;
        scale = 1;
        hasFilled = false;
        gl.clear(gl.COLOR_BUFFER_BIT);
    });
    
    document.getElementById("Right").addEventListener("click", function() {
        if (!canTransform) {
            return;
        }
        closed = true;  
        translation.x += 0.1;
        drawPolygon(gl, vertices);
    });
    
    document.getElementById("Left").addEventListener("click", function() {
        if (!canTransform) {
            return;
        }
        closed = true;
        translation.x -= 0.1;
        drawPolygon(gl, vertices);
    });
    
    document.getElementById("Up").addEventListener("click", function() {
        if (!canTransform) {
            return;
        }
        closed = true;
        translation.y += 0.1;
        drawPolygon(gl, vertices);
    });
    
    document.getElementById("Down").addEventListener("click", function() {
        if (!canTransform) {
            return;
        }
        closed = true;
        translation.y -= 0.1;
        drawPolygon(gl, vertices);
    });
    
    document.getElementById("Clockwise").addEventListener("click", function() {
        if (!canTransform) {
            return;
        }
        closed = true;
        theta += Math.PI / 18;
        drawPolygon(gl, vertices);
    });
    
    document.getElementById("Counterclockwise").addEventListener("click", function() {
        if (!canTransform) {
            return;
        }
        closed = true;
        theta -= Math.PI / 18;
        drawPolygon(gl, vertices);
    });
    
    document.getElementById("Fill").addEventListener("click", function() {
        if (!canTransform) {
            return;
        }
        if (hasFilled) {
            return;
        }
        if (vertices.length > 2) {
            closed = true;
            const vertexArray = vertices.flatMap(v => [v.x, v.y]);
            filledTriangles = earClippingTriangulation(vertexArray);
            hasFilled = true;
            drawPolygon(gl, vertices);
        }
    });
    
    document.getElementById("scaleInput").addEventListener("input", (event) => {
        if (!canTransform) {
            return;
        }
        scale = parseFloat(event.target.value);
        drawPolygon(gl, vertices);
    });
});