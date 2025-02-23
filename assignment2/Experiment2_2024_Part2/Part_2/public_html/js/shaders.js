/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const vsSource = `#version 300 es
    in vec2 aPosition;
    uniform vec2 uRotation;
    uniform vec2 uTranslation;
    void main() {
        float x = aPosition.x * uRotation.y - aPosition.y * uRotation.x;
        float y = aPosition.x * uRotation.x + aPosition.y * uRotation.y;
        vec2 position = vec2(x,y) + uTranslation;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const fsSourceYellow = `#version 300 es
    precision highp float;
    uniform vec4 uColor;
    out vec4 fragColor;
    void main() {
        fragColor = uColor;
    }
`;

const fsSourceRed = `#version 300 es
    precision highp float;
    out vec4 fragColor;
    void main() {
        fragColor = vec4(169.0/255.0, 4.0/255.0, 50.0/255.0, 1.0);
    }
`;