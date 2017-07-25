// Play some brown noise
var scriptNode, oscNode
function playNoise () {
  // Create AudioContext and OscillatorNode.
  // The latter is just to keep the pipeline going, the actual sine wave produced is ignored.
  var audioCtx = new window.AudioContext()
  oscNode = audioCtx.createOscillator()
  oscNode.frequency.value = 123.456789

  // Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
  scriptNode = audioCtx.createScriptProcessor(1 << 12, 1, 1)

  // Give the node a function to process audio events
  var x0 = 0.0
  var x1 = 0.0
  var x2 = 0.0
  var x3 = 0.0
  var fade = 1.0
  scriptNode.onaudioprocess = function (ev) {
    // Generate the output signal
    var outputData = ev.outputBuffer.getChannelData(0)
    for (var i = 0; i < outputData.length; i++) {
      var white = Math.random() * 2 - 1
      x0 = (x0 + 0.01 * white) / 1.01
      x1 = (x1 + 0.001 * white) / 1.001
      x2 = (x2 + 0.0001 * white) / 1.0001
      x3 = (x3 + 0.00001 * white) / 1.00001
      fade *= 0.999995
      outputData[i] = (1.0 - fade) * (x0 + 5 * x1 + 30 * x2 + 60 * x3)
    }
  }

  oscNode.connect(scriptNode)
  scriptNode.connect(audioCtx.destination)
  oscNode.start()
}

// Show some static
function drawNoise () {
  var canvas = document.getElementsByTagName('canvas')[0]
  var ctx, image, rand, w, h
  function resize () {
    var elemW, elemH
    if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
      elemW = window.innerWidth
      elemH = window.innerHeight
      canvas.style.width = elemW + 'px'
    } else {
      elemW = canvas.clientWidth
      elemH = canvas.clientHeight
      canvas.style.width = '100%'
    }
    var targetW = Math.floor(elemW / 4)
    var targetH = Math.floor(elemH / 4)
    if (w === targetW && h === targetH) {
      return
    }

    console.log('Resizing')
    w = canvas.width = targetW
    h = canvas.height = targetH
    ctx = canvas.getContext('2d')
    ctx.translate(0.5, 0.5)
    image = ctx.createImageData(w, h)
    rand = new Float32Array(w * h)
  }

  function paint () {
    resize()

    var i, j, x
    for (i = 0; i < w * h; i++) {
      var white = Math.random() * 2 - 1
      rand[i] = (rand[i] + white * 0.2) * 0.99
    }
    for (j = 0; j < h; j++) {
      for (i = 0; i < w; i++) {
        x = 0.6 * rand[i + j * w] +
          0.15 * rand[(i + 1) % w + (j + 0) * w] +
          0.05 * rand[(i + w - 1) % w + (j + 0) * w] +
          0.12 * rand[(i + 0) + (j + 1) % h * w] +
          0.08 * rand[(i + 0) + (j + h - 1) % h * w]
        rand[i + j * w] = x
      }
    }
    for (j = 0; j < h; j++) {
      for (i = 0; i < w; i++) {
        var ix = i + j * w
        x = 128.0 + 128.0 * rand[ix]
        image.data[4 * ix] = x
        image.data[4 * ix + 1] = x
        image.data[4 * ix + 2] = x
        image.data[4 * ix + 3] = 255
      }
    }
    ctx.putImageData(image, 0, 0)
    window.requestAnimationFrame(paint)
  }
  paint()
  document.getElementById('fullscreen').onclick = function () {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen()
    } else {
      canvas.webkitRequestFullscreen()
    }
  }
}

window.onload = function () {
  console.log('Starting audio...')
  playNoise()
  console.log('Starting video...')
  drawNoise()
  console.log('Running.')
}
