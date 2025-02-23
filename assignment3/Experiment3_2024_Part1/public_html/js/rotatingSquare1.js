"use strict";

var canvas;
var gl;

var theta = 0.0;
var addValue = 0.1;
var thetaLoc;
var colors = [
    vec4(Math.random(), Math.random(), Math.random(), 1.0),
    vec4(Math.random(), Math.random(), Math.random(), 1.0),
    vec4(Math.random(), Math.random(), Math.random(), 1.0),
    vec4(Math.random(), Math.random(), Math.random(), 1.0)
];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext("webgl2");
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vertices = [
        vec2(  0,  1 ),
        vec2(  -1,  0 ),
        vec2( 1,  0 ),
        vec2(  0, -1 )
    ];
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    thetaLoc = gl.getUniformLocation( program, "theta" );
    document.getElementById("slowDown").onclick = function() {slowDown()};
    document.getElementById("toggle").onclick = function() {toggle()};
    document.getElementById("speedUp").onclick = function() {speedUp()};
    document.getElementById("color").onclick = function() {color()};

    render();
    function render() {

        gl.clear( gl.COLOR_BUFFER_BIT );

        theta += addValue;
        gl.uniform1f( thetaLoc, theta );

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

        requestAnimationFrame(render);
    }

    function toggle() {
        addValue *= -1;
    }

    function speedUp() {
        addValue += (addValue > 0 ? 0.01 : -0.01);
    }

    function color() {
        colors = [
            vec4(Math.random(), Math.random(), Math.random(), 1.0),
            vec4(Math.random(), Math.random(), Math.random(), 1.0),
            vec4(Math.random(), Math.random(), Math.random(), 1.0),
            vec4(Math.random(), Math.random(), Math.random(), 1.0)
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    }

    function slowDown() {
        if (addValue > 0.02) {
            addValue -= 0.01;
        } else if (addValue < -0.02) {
            addValue += 0.01;
        } else {
            addValue = (addValue > 0 ? 0.02 : -0.02);
        }

    }
};