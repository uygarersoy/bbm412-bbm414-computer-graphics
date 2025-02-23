precision highp float;

uniform float uTime;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform float uWaveHeight;
uniform float uWaveFrequency;
uniform float uWaveSpeed;


void main() {
    float wave = sin(position.x * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight;
    vec3 transformedPosition = position + vec3(0.0, 0.0, wave);
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(transformedPosition, 1.0);
}