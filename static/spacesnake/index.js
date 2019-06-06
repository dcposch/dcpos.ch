console.log('hello world')

const title = document.querySelector('h1')
const section = document.querySelector('section')
const score = document.querySelector('#score')

const w = 10
const cells = []
for (let i = 0; i < w; i++) {
    cells[i]  = []
    const row = document.createElement('section')
    for (let j = 0; j < w; j++) {
        cells[i][j] = document.createElement('div')
        row.appendChild(cells[i][j])
    }
    section.appendChild(row)
}

const colBg = 'rgb(160, 160, 160)'
const colSnake = 'rgb(40, 180, 40)'
const colDone = 'rgb(220, 220, 220)'
const colObstacle = 'rgb(40, 40, 40)'
const colFood  = 'rgb(220, 150, 20)'

let dirx = 0
let diry = -1
let snake = [[0, w - 1]]
set(snake[0], colSnake)
let snakel = 6

let edible = w * w - 1

// place food
for (let i = 0; i < 6; i++) {
    const ox = (Math.random() * w) | 0
    const oy = (Math.random() * w) | 0
    if (get([ox, oy]) !== '') {
        continue
    }
    set([ox, oy], colFood)
    edible--
}

// place obstacles
for (let i = 0; i < 4; i++){
    const ox = (Math.random() * (w - 3) + 1) | 0
    const oy = (Math.random() * (w - 3) + 1) | 0
    if (set([ox, oy], colObstacle) === '') edible--
    if (set([ox, oy+1], colObstacle) === '') edible--
    if (set([ox+1, oy], colObstacle) === '') edible--
    if (set([ox+1, oy+1], colObstacle) === '') edible--
}

let uneaten = edible
let fno = 0

window.addEventListener('keydown', onKey)

let pressed = false
function onKey(e) {
    if (e.key === ' '){
        pressed = true
    }
 }

frame()

function frame() {
    if (++fno % 18 === 0) {
        turn()
    }
    window.requestAnimationFrame(frame)
}

function turn() {

    // handle input
    if (pressed) {
        const t = dirx
        dirx = -diry
        diry = t
        pressed = false
    }

    // move head of snake to snake
    const head = snake[snake.length - 1]
    const next = [head[0] + dirx, head[1] + diry]
    snake.push(next)
    const prevCol = set(next, colSnake)

    // victory condition
    if (prevCol === '' || prevCol === colBg) {
        uneaten--
    } else if (prevCol === colFood) {
        snakel++
    } else if (prevCol !== colDone) {
        end('crash')
    }

    score.innerText = `${100 - uneaten} / 100`

    if (uneaten === 0) end('victory')

    // remove tail of snake
    if (snake.length > snakel) {
        set(snake.shift(), colDone)
    }
}

function get(xy) {
    return cells[xy[1]][xy[0]].style.background
}

function set(xy, col) {
    const row = cells[xy[1]]
    if (row == null) end('crash')
    const cell = row[xy[0]]
    if (cell == null) end('crash')
    const ret = cell.style.background
    cell.style.background = col
    return ret
}

function end(msg) {
    title.innerText = msg
    throw msg
}
