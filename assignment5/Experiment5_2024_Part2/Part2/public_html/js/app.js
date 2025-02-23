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
let cameraZoom = 75;

let lastMouseX = 0;
let lastMouseY = 0;
let isMouseDown = false;
let mouseButton = null;

let cameraPosition = [30, 40, cameraZoom];
let cameraRotation = [0, 0];
let cameraTranslation = [0, 0, 0];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

if (!gl) {
    console.error("WebGL2 is not available in your browser.");
    throw new Error("WebGL2 is required.");
}

async function main() {
    program = initProgram(gl, vsSource, fsSource);
    if (!program){
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);

    const objResponse = await fetch("./resources/bitki.obj");
    const objText = await objResponse.text();
    const { vertices, normals, textures, faces } = parseOBJ(objText);
    const { flatVertices, flatNormals, flatTextures } = flattenOBJData(vertices, normals, textures, faces);

    const sphereData = createSphere(15, 30, 30);

    const buffers = setupBuffers(gl, { flatVertices, flatNormals }, sphereData);
    const { plantVertexBuffer, plantNormalBuffer, sphereVertexBuffer, sphereNormalBuffer, sphereIndexBuffer } = buffers;

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const normalLocation = gl.getAttribLocation(program, "a_normal");
    const mvpLocation = gl.getUniformLocation(program, "u_mvpMatrix");
    const lightPositionLocation = gl.getUniformLocation(program, "u_lightPosition");

    gl.uniform3fv(lightPositionLocation, [5.0, 5.0, 5.0]);

    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);
    mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 0], [0, 1, 0]);

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onMouseWheel);
    window.addEventListener("resize", resizeCanvas);


    function setupBuffers(gl, plantData, sphereData) {
        const { flatVertices, flatNormals } = plantData;
        const { vertices: sphereVertices, normals: sphereNormals, indices: sphereIndices } = sphereData;
    
        const plantVertexBuffer = initBuffer(gl, flatVertices);
        const plantNormalBuffer = initBuffer(gl, flatNormals);
    
        const sphereVertexBuffer = initBuffer(gl, sphereVertices);
        const sphereNormalBuffer = initBuffer(gl, sphereNormals);
    
        const sphereIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);
    
        return {
            plantVertexBuffer,
            plantNormalBuffer,
            sphereVertexBuffer,
            sphereNormalBuffer,
            sphereIndexBuffer,
        };
    }
    
    function flattenOBJData(vertices, normals, textures, faces) {
        const flatVertices = [];
        const flatNormals = [];
        const flatTextures = [];
    
        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];
            for (let j = 0; j < face.length; j++) {
                const vertexIndex = face[j].vertex;
                const normalIndex = face[j].normal;
                const textureIndex = face[j].texture;
    
                const vertex = vertices.slice(vertexIndex * 3, vertexIndex * 3 + 3);
                const normal = normals.slice(normalIndex * 3, normalIndex * 3 + 3);
                const texture = textures.slice(textureIndex * 2, textureIndex * 2 + 2);
    
                flatVertices.push(...vertex);
                flatNormals.push(...normal);
                flatTextures.push(...texture);
            }
        }
    
        return { flatVertices, flatNormals, flatTextures };
    }
    
    function renderSphere(vertexBuffer, normalBuffer, indexBuffer, position, rotation, mvpLocation, indexCount) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0); 
        gl.enableVertexAttribArray(positionLocation); 
    
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer); 
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0); 
        gl.enableVertexAttribArray(normalLocation); 
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); 
    
        const mvpMatrix = generateMVPMatrix(position, rotation); 
        gl.uniformMatrix4fv(mvpLocation, false, mvpMatrix); 
    
        gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0); 
    }

    function generateMVPMatrix(position, rotation) {
        const modelMatrix = mat4.create();
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, position);
        mat4.rotateY(modelMatrix, modelMatrix, rotation);
    
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
    
        const mvpMatrix = mat4.create();
        mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);
    
        return mvpMatrix;
    }
    
    function renderPlant(vertexBuffer, normalBuffer, position, rotation, mvpLocation) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0); 
        gl.enableVertexAttribArray(positionLocation); 

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer); 
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0); 
        gl.enableVertexAttribArray(normalLocation); 

        const mvpMatrix = generateMVPMatrix(position, rotation); 
        gl.uniformMatrix4fv(mvpLocation, false, mvpMatrix); 
        gl.drawArrays(gl.TRIANGLES, 0, flatVertices.length / 3); 
    }

    function render(time) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);
        mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 0], [0, 1, 0]);

        const lightRadius = 20.0;
        const lightAngle = time * 0.001;
        const lightPosition = [
            lightRadius * Math.sin(lightAngle),
            5.0,
            lightRadius * Math.cos(lightAngle)
        ];

        gl.uniform3fv(lightPositionLocation, lightPosition);
        renderSphere(
                sphereVertexBuffer, sphereNormalBuffer, sphereIndexBuffer,
                [0, 0, 0], rotation, mvpLocation, sphereData.indices.length
            );
        renderPlant(plantVertexBuffer, plantNormalBuffer, [0, 15, 0], rotation, mvpLocation);
        rotation += 0.01;
        requestAnimationFrame(render);
    }

    function createSphere(radius, latitude, longitude) {
        const vertices = [];
        const normals = [];
        const indices = [];
    
        for (let i = 0; i <= latitude; i++) {
            const theta = i * Math.PI / latitude;
            const sin = Math.sin(theta);
            const cos = Math.cos(theta);
    
            for (let j = 0; j <= longitude; j++) {
                const phi = j * 2 * Math.PI / longitude;
                const s = Math.sin(phi);
                const c = Math.cos(phi);
    
                const x = c * sin;
                const y = cos;
                const z = s * sin;
    
                normals.push(x, y, z);
                vertices.push(radius * x, radius * y, radius * z);
            }
        }
    
        for (let i = 0; i < latitude; i++) {
            for (let j = 0; j < longitude; j++) {
                const f = (i * (longitude + 1)) + j;
                const s = f + longitude + 1;
    
                indices.push(f, s, f + 1);
                indices.push(s, s + 1, f + 1);
            }
        }
    
        return { vertices, normals, indices };
    }
     
    function parseOBJ(objText) {
        const vertices = [];
        const normals = [];
        const textures = [];
        const faces = [];
        
        const lines = objText.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === "") {
                continue;
            }
            const parts = line.split(" ");
            const type = parts[0];
            const data = parts.slice(1);
    
            if (type === "v") {
                for (let j = 0; j < data.length; j++) {
                    vertices.push(parseFloat(data[j]));
                }
            } else if (type === "vn") {
                for (let j = 0; j < data.length; j++) {
                    normals.push(parseFloat(data[j]));
                }
            } else if (type === "vt") {
                for (let j = 0; j < data.length; j++) {
                    textures.push(parseFloat(data[j]));
                }
            } else if (type === "f") {
                const face = [];
                for (let j = 0; j < data.length; j++) {
                    const indices = data[j].split("/");
                    face.push({
                        vertex: parseInt(indices[0], 10) - 1,
                        texture: indices[1] ? parseInt(indices[1], 10) - 1 : null,
                        normal: indices[2] ? parseInt(indices[2], 10) - 1 : null
                    });
                }
                if (face.length === 4) {
                    faces.push([face[0], face[1], face[2]]);
                    faces.push([face[0], face[2], face[3]]);
                }
            }
        }
        
        return { vertices, normals, textures, faces };
    }
      
    function onMouseDown(event) {
        isMouseDown = true;
        [mouseButton, lastMouseX, lastMouseY] = [event.button, event.clientX, event.clientY];
        updateViewMatrix();
    }

    function onMouseUp() {
        isMouseDown = false;
        mouseButton = null;
        updateViewMatrix();
    }

    function onMouseMove(event) {
        if (!isMouseDown) {
            return;
        }
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
        updateViewMatrix();
    }

    function onMouseWheel(event) {
        cameraZoom = Math.max(5, Math.min(100, cameraZoom - event.deltaY * 0.1));
        updateViewMatrix();
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
        updateViewMatrix();

    }
    
    resizeCanvas();
    requestAnimationFrame(render);
}

main();