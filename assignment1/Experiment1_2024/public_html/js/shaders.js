/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const vsSource = `
    attribute vec2 aPosition;
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const fsSourceYellow = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(253.0/255.0, 185.0/255.0, 18.0/255.0, 1.0);
    }
`;

const fsSourceRed = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(169.0/255.0, 4.0/255.0, 50.0/255.0, 1.0);
    }
`;