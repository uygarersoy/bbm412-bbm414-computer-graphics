/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

function areaOfATriangle(point1, point2, point3) {
    return Math.abs((point1.x * (point2.y - point3.y) + point2.x * (point3.y - point1.y ) + point3.x * (point1.y - point2.y)) /2.0);
}

function isPointInTriangle(point, v1, v2, v3) {
    const v1v2v3 = areaOfATriangle(v1, v2, v3);
    const pointV1V2 = areaOfATriangle(point, v1, v2);
    const pointV1V3 = areaOfATriangle(point, v1, v3);
    const pointV2V3 = areaOfATriangle(point, v2, v3);

    return (pointV1V2 + pointV1V3 + pointV2V3) === v1v2v3;
}

function isCounterClockwise (v0, v1, v2) {
    return (v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x) > 0;
};

function pairVertices(vertices) {
    const result = [];
    for (let i = 0; i < vertices.length; i += 2) {
        result.push({ x: vertices[i], y: vertices[i+1]});
    }
    return result;
}


function isClockwise(vertices) {
    let sum = 0;
    for (let i = 0; i < vertices.length; i++) {
        const j = (i + 1) % vertices.length;
        sum += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
    }
    return sum > 0;
}


function earClippingTriangulation(vertices) {
    let pairedVertices = pairVertices(vertices);
    if (isClockwise(pairedVertices)) {
        pairedVertices = pairedVertices.reverse();
    }

    const triangles = [];
    while (pairedVertices.length > 3) {
        for (let i = 0; i < pairedVertices.length; i++) {
            const previous = pairedVertices[(i - 1 + pairedVertices.length) % pairedVertices.length];
            const previousIndex = (i - 1 + pairedVertices.length) % pairedVertices.length;
            const current = pairedVertices[i];
            const next = pairedVertices[(i + 1) % pairedVertices.length];
            const nextIndex = (i + 1) % pairedVertices.length;

            if (isCounterClockwise(previous, current, next)) {
                let flag = true;
                for (let j = 0; j < pairedVertices.length; j++) {
                    if (j !== i && j !== previousIndex && j !== nextIndex) {
                        if (isPointInTriangle(pairedVertices[j], previous, current, next)) {
                            flag = false;
                            break;
                        }
                    }
                }
                if (flag) {
                    triangles.push(previous.x, previous.y)
                    triangles.push(current.x, current.y)
                    triangles.push(next.x, next.y);
                    pairedVertices.splice(i, 1);
                    earFound = true;
                    break;
                }            
            }            
        }
    }
    triangles.push(pairedVertices[0].x, pairedVertices[0].y);
    triangles.push(pairedVertices[1].x, pairedVertices[1].y);
    triangles.push(pairedVertices[2].x, pairedVertices[2].y);
    return triangles;
}