/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


const vsSource = `#version 300 es
    in vec2 aPosition;
    uniform vec2 uTranslation;
    uniform float theta;
    uniform float uScale;
    
    void main() {
        vec2 scaledPosition = aPosition * uScale;
        float cosTheta = cos(theta);
        float sinTheta = sin(theta);
        
        mat2 rotationMatrix = mat2(cosTheta, -sinTheta, sinTheta, cosTheta);
        vec2 rotatedPosition = rotationMatrix * scaledPosition;
        gl_Position = vec4(rotatedPosition + uTranslation, 0.0, 1.0);
    }
`;

const fsSource = `#version 300 es
    precision mediump float;
    uniform vec4 uColor;
    out vec4 fragColor;
    
    void main() {
        fragColor = uColor;
    }
`;