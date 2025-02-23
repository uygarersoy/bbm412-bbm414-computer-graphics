precision highp float;

uniform float uTime;
uniform float uWaveHeight;
uniform float uWaveFrequency;
uniform float uWaveSpeed;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

out vec3 vPosition;

void main() {

    float waveX = sin(position.x * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight;
    float waveY = sin(position.y * uWaveFrequency * 1.2 + uTime * uWaveSpeed * 0.8) * uWaveHeight;
    float wave = waveX + waveY;

    vec3 transformedPosition = position + vec3(0.0, 0.0, wave);
    vPosition = transformedPosition;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(transformedPosition, 1.0);
}