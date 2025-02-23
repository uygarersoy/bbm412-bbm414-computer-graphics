/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
let canvas = document.getElementById("glCanvas");
let gl = canvas.getContext("webgl2");

let projectionMatrix = mat4.create();
let viewMatrix = mat4.create();
let modelMatrix = mat4.create();
let mvpMatrix = mat4.create();

let program;
let rotation = 0;
let zoom = 5;
let cameraZoom = 30;
let upDown = 0;

let lastMouseX = 0;
let lastMouseY = 0;
let isMouseDown = false;
let mouseButton = null;

let cameraPosition = [0, 0, cameraZoom];
let cameraRotation = [0, 0];
let cameraTranslation = [0, 0, 0];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

if (!gl) {
    console.error("WebGL2 is not available in your browser.");
    throw new Error("WebGL2 is required.");
}

async function main() {
    const response = await fetch("monkey_head.obj");
    const objText = await response.text();
    const { vertices, normals, faces } = parseOBJ(objText);

    const flatVertices = [];
    const flatNormals = [];

    for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        for (let j = 0; j < face.length; j++) {
            const vertexIndex = face[j].vertex;
            const normalIndex = face[j].normal;
    
            const vertex = vertices.slice(vertexIndex * 3, vertexIndex * 3 + 3);
            const normal = normals.slice(normalIndex * 3, normalIndex * 3 + 3);
    
            flatVertices.push(...vertex);
            flatNormals.push(...normal);
        }
    }
    
    program = initProgram(gl, vsSource, fsSource);
    if (!program){
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);

    const vertexBuffer = initBuffer(gl, flatVertices);
    const normalBuffer = initBuffer(gl, flatNormals);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const normalLocation = gl.getAttribLocation(program, "a_normal");

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLocation);

    const mvpLocation = gl.getUniformLocation(program, "u_mvpMatrix");
    const lightPositionLocation = gl.getUniformLocation(program, "u_lightPosition");

    gl.uniform3fv(lightPositionLocation, [3.0, 4.0, 5.0]);

    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);
    mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 0], [0, 1, 0]);

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onMouseWheel);
    window.addEventListener("resize", resizeCanvas);

    function generateMVPMatrix(position, rotation) {
        const modelMatrix = mat4.create();
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, position);

        if (rotation) {
            mat4.rotateY(modelMatrix, modelMatrix, rotation);
        }
    
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
    
        const mvpMatrix = mat4.create();
        mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);
    
        return mvpMatrix;
    }
    
    function renderMonkey(position, rotation) {
        const mvpMatrix = generateMVPMatrix(position, rotation);
    
        gl.uniformMatrix4fv(mvpLocation, false, mvpMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, flatVertices.length / 3);
    }

    function render(time) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);
        mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 0], [0, 1, 0]);

        rotation += 0.05;
        zoom = 5 + Math.sin(time * 0.005) * 3;
        upDown = Math.sin(time * 0.005) * 3;

        renderMonkey([-6, 0, zoom], null);
        renderMonkey([0, 0, 0], rotation);
        renderMonkey([6, upDown, 0], null);

        updateViewMatrix();
        requestAnimationFrame(render);
    }
    
    function parseOBJ(objText) {
        const vertices = [];
        const normals = [];
        const faces = [];
        
        objText.split("\n").forEach(line => {
            const [type, ...data] = line.trim().split(" ");
            
            if (type === "v") {
                vertices.push(...data.map(Number));
            } else if (type === "vn") {
                normals.push(...data.map(Number));
            } else if (type === "f") {
                faces.push(data.map(face => {
                    const [vertexIndex, , normalIndex] = face.split("/").map(Number);
                    return { vertex: vertexIndex - 1, normal: normalIndex - 1 };
                }));
            }
        });
        
        return { vertices, normals, faces };
    }    

    function onMouseDown(event) {
        isMouseDown = true;
        [mouseButton, lastMouseX, lastMouseY] = [event.button, event.clientX, event.clientY];
    }

    function onMouseUp() {
        isMouseDown = false;
        mouseButton = null;
    }

    function onMouseMove(event) {
        if (!isMouseDown) return;
        
        const [deltaX, deltaY] = [event.clientX - lastMouseX, event.clientY - lastMouseY];
        
        switch (mouseButton) {
            case 0:
                cameraRotation[0] += deltaX * 0.01;
                cameraRotation[1] = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation[1] + deltaY * 0.01));
                break;
            case 1:
                cameraZoom = Math.max(1, Math.min(50, cameraZoom - deltaY * 0.01));
                break;
            case 2:
                cameraTranslation[0] += deltaX * 0.01;
                cameraTranslation[1] -= deltaY * 0.01;
                break;
        }
        
        [lastMouseX, lastMouseY] = [event.clientX, event.clientY];
    }

    function onMouseWheel(event) {
        cameraZoom = Math.max(5, Math.min(50, cameraZoom - event.deltaY * 0.1));
    }

    function updateViewMatrix() {
        const forward = [
            Math.sin(cameraRotation[0]) * Math.cos(cameraRotation[1]),
            Math.sin(cameraRotation[1]),
            Math.cos(cameraRotation[0]) * Math.cos(cameraRotation[1]),
        ];
    
        const target = [0, 0, 0];
        const up = [0, 1, 0];
    
        cameraPosition = [
            target[0] + forward[0] * cameraZoom + cameraTranslation[0],
            target[1] + forward[1] * cameraZoom + cameraTranslation[1],
            target[2] + forward[2] * cameraZoom,
        ];
    
        mat4.lookAt(viewMatrix, cameraPosition, target, up);
    }   
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    
        mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);
    }
    
    resizeCanvas();
    requestAnimationFrame(render);
}

main();