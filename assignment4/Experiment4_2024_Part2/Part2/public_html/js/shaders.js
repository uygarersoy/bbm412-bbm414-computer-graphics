/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
const vsSource = `#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_mvpMatrix;

out vec3 v_normal;
out vec3 v_position;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    v_normal = a_normal;
    v_position = a_position;
}

`;

const fsSource = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_position;
uniform vec3 u_lightPosition;
out vec4 fragColor;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(u_lightPosition - v_position);

    float diffuse = max(dot(normal, lightDir), 0.0);
    vec3 color = vec3(1.0, 1.0, 1.0) * diffuse;
    fragColor = vec4(color, 1.0);
}
`;