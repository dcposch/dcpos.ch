
const vertexShaderCode = `
    precision highp float;

    attribute vec3 aVertexPosition;
    attribute vec3 aVertexColor;

    uniform mat4 uMatrix;

    varying vec4 vColor;

    void main(void) {
        gl_Position = uMatrix * vec4(aVertexPosition, 1.0);
        vColor = vec4(aVertexColor, 1.0);
    }
`

const fragmentShaderCode = `
    precision highp float;

    varying vec4 vColor;

    void main(void) {
        gl_FragColor = vColor;
    }
`

// Find the canvas
const canvas = document.getElementById('sparkle-cube')

// Start WebGL for that canvas
const gl = canvas.getContext('webgl', {antialias: true}) || die('No WebGL')
console.log('GL attribs: ' + JSON.stringify(gl.getContextAttributes(), null, 2))
gl.clearColor(1.0, 1.0, 1.0, 1.0)
gl.enable(gl.DEPTH_TEST)

// Compile shaders
const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderCode)
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderCode)
const prog = linkProgram(vertexShader, fragmentShader)

const posUMatrix = getUniform(prog, 'uMatrix')
const posAVertPos = getAttribute(prog, 'aVertexPosition')
const posAVertColor = getAttribute(prog, 'aVertexColor')

// Create the scene
// A cube has 6 faces = 12 triangles = 36 vertices
const cubeVertices = new Float32Array([
    0, 0, 0, 
    0, 0, 1, 
    0, 1, 0,
    0, 0, 0,
    0, 1, 0,
    0, 1, 1,

    0, 0, 0, 
    0, 0, 1, 
    1, 0, 0,
    0, 0, 0,
    1, 0, 0,
    1, 0, 1,

    0, 0, 0,
    0, 1, 0,
    1, 0, 0,
    0, 0, 0,
    1, 0, 0,
    1, 1, 0,

    1, 0, 0, 
    1, 0, 1, 
    1, 1, 0,
    1, 0, 0,
    1, 1, 0,
    1, 1, 1,

    0, 1, 0, 
    0, 1, 1, 
    1, 1, 0,
    0, 1, 0,
    1, 1, 0,
    1, 1, 1,

    0, 0, 1,
    0, 1, 1,
    1, 0, 1,
    0, 0, 1,
    1, 0, 1,
    1, 1, 1,
])

const bufferPosition = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition)
gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW)

const bufferColor = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor)
gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW)

// Start rendering
frame()

function frame () {
    // Clear the frame
    const {width, height} = canvas
    gl.viewport(0, 0, width, height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  
    // Setup camera
    const projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix, 1, width / height, 0.2, 4000.0)
    mat4.translate(projectionMatrix, projectionMatrix, [-.5, -.5, -5])

    // Choose the shader program. Set uniforms.
    // You usually set uniforms ~once per frame.
    // The uniforms are the same for each invocation of the shader function.
    gl.useProgram(prog)
    
    gl.uniformMatrix4fv(posUMatrix, false, projectionMatrix)

    gl.enableVertexAttribArray(posAVertPos)
    gl.enableVertexAttribArray(posAVertColor)
  
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition)
    gl.vertexAttribPointer(posAVertPos, 3, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor)
    gl.vertexAttribPointer(posAVertColor, 3, gl.FLOAT, false, 0, 0)

    // Render. The attributes come from successive data in the buffers.
    // The attributes are different for each invocation of the vertex shader.
    gl.drawArrays(gl.TRIANGLES, 0, 36)

    console.log('Frame')
}

function compileShader (type, code) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, code)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        die(gl.getShaderInfoLog(shader))
    }
    return shader
}

function linkProgram (vertexShader, fragmentShader) {
    const prog = gl.createProgram()
    gl.attachShader(prog, vertexShader)
    gl.attachShader(prog, fragmentShader)
    gl.linkProgram(prog)
    console.log('Link status: ' + gl.getProgramParameter(prog, gl.LINK_STATUS))
    return prog
}

function getAttribute (prog, name) {
    const pos = gl.getAttribLocation(prog, name)
    if (pos === null || pos < 0) {
        die(`Attribute ${name} not found. Maybe stripped out because unused?`)
    }
    return pos
}

function getUniform (prog, name) {
    const pos = gl.getUniformLocation(prog, name)
    if (pos === null || pos < 0) {
        die(`Uniform ${name} not found. Maybe stripped out because unused?`)
    }
    return pos
}

function die(msg) {
    throw new Error(msg)
}