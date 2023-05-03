

let bg
let pg
const mask = {
  circle: null,
  diamond: null,
  triangle: null,
  Line_1: null,
  Line_2: null,
  user: null,
}
let clock_r = 0

const shapeSize = 40
const MARGIN_LEFT = 30 // 屏幕左面留的空白

const GAME = {
  word: '',  // 输入的单词
  shape: 'A', // 选择的形状
  color: ['red', 'red'], // 选择的颜色（纯色则两个值一样，渐变就是start-stop）
  state: 'stop',
  autoDrawX: 0, // 自动绘画x
  autoDrawY: 0,
  autoDrawRotate: 0,
  size: 1,
}

let autoDrawer = null

class AutoDrawer {
  constructor() {
    this.x = width / 2
    this.y = height / 2
    this.angle = 0
    this.r = 0

  }

  update() {
    this.angle += map(this.r, 0, clock_r, 10, 0.01)
    if (this.angle >= 360) {
      this.r += 4
      this.angle = 0
    }
    this.x = width / 2 + this.r * cos(this.angle)
    this.y = height / 2 + this.r * sin(this.angle)
  }


  draw() {
    drawShape(this.x, this.y)
  }
}

function preload() {
  diamondImg = loadImage('assets/diamond.png')
  triangleImg = loadImage('assets/triangle.png')
  circleImg = loadImage('assets/circle.png')
  Line_1Img = loadImage('assets/Line_1.png')
  Line_2Img = loadImage('assets/Line_2.png')
  userImg = loadImage('assets/user.png')
}

function setup() {
  createCanvas(innerWidth, innerHeight - 1)
  pg = createGraphics(width, height)

  background(0)
  stroke(255)
  fill(255)
  angleMode(DEGREES)
  rectMode(CENTER)
  blendMode(LIGHTEST);

  initRightElement()
  clock_r = height * 0.35

  diamondImg.resize(shapeSize, shapeSize)
  triangleImg.resize(shapeSize, shapeSize)
  circleImg.resize(shapeSize, shapeSize)
  Line_1Img.resize(shapeSize, shapeSize)
  Line_2Img.resize(shapeSize, shapeSize)
  mask.diamond = diamondImg
  mask.triangle = triangleImg
  mask.circle = circleImg
  mask.Line_1 = Line_1Img
  mask.Line_2 = Line_2Img
  mask.user = userImg
}

// 背景图案
function initPg() {
  // gradient color
  for (let i = 0; i <= height; i++) {
    var inter = map(i, 0, height, 0, 1);
    var c = lerpColor(color(GAME.color[0]), color(GAME.color[1]), inter);
    c.setAlpha(20)
    pg.stroke(c);
    pg.line(0, i, width, i);
  }

  pg.noStroke()
  pg.fill(200, 200, 200, 15)
  pg.textSize(150)
  pg.textAlign(CENTER, CENTER)
  pg.textWrap(CHAR)
  pg.rectMode(CENTER)
  pg.text(GAME.word, width / 2, height / 2, 1.5 * clock_r, 3 * clock_r)
  // image(pg, 0, 0, width, height)
}

/**
 * 移动形状
 * @param x 
 * @param y 
 * @param maskImg 
 */

function moveShapeBy(x, y, maskImg) {
  const n = GAME.size * shapeSize
  maskImg.resize(n, n)
  let tempImg = createImage(n, n)
  tempImg.copy(pg, x - n / 2, y - n / 2, n, n, 0, 0, n, n)
  tempImg.mask(maskImg)

  push()
  translate(x, y)
  if (autoDrawer != null) { // 自动绘画
    rotate(frameCount / 0.5)
  }
  copy(tempImg, 0, 0, n, n, - n / 2, - n / 2, n, n)
  pop()
}

function drawShape(x, y) {
  if (dist(x, y, width / 2, height / 2) < clock_r - shapeSize) {
    // noCursor()
    switch (GAME.shape) {
      case 'A': // 圆形
        moveShapeBy(x, y, mask.circle)
        break
      case 'B': // 菱形
        moveShapeBy(x, y, mask.diamond)
        break
      case 'C': // 三角形
        moveShapeBy(x, y, mask.triangle)
        break
      case 'D': // 线1
        moveShapeBy(x, y, mask.Line_1)
        break
      case 'E': // 线2
        moveShapeBy(x, y, mask.Line_2)
        break
      case 'F': // 用户
        moveShapeBy(x, y, mask.user)
        break
    }
  } else {
    // cursor()
  }
}

function draw() {
  background(0)
  clock()

  if (GAME.state == 'manual_draw' && GAME.word != '') {
    if (autoDrawer != null) {
      autoDrawer.update()
      autoDrawer.draw()
    } else {
      drawShape(mouseX, mouseY)
    }
  }

}

function onDownload() {
  const c = createImage(width, height)

  c.loadPixels()
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let p = get(x, y)

      if (dist(x, y, width / 2, height / 2) > clock_r - 10) {
        c.set(x, y, color(255, 255, 255, 0))
      } else {
        c.set(x, y, p)
      }
    }
  }
  c.updatePixels()
  const a = createGraphics(width, height)
  a.background(c)
  saveCanvas(a, 'SpiroFont', 'png')
}

// Press 'Enter'
function onConfirm() {
  document.querySelector('.tip').classList.add('active')

  GAME.word = select('.word-input').value()
  GAME.state = 'manual_draw'

  initPg()
}

// Restart
function onRestart() {
  GAME.state = 'stop'
  autoDrawer = null // reset
  clear()
  pg.clear()

  document.querySelectorAll('#shapeBtn button').forEach(x => {
    x.classList.remove('active')
  })
  document.querySelectorAll('.size button').forEach(x => {
    x.classList.remove('active')
  })

  document.querySelector('.word-input').value = ''
  document.querySelector('#gradientColor').classList.remove('active')
  document.querySelector('#pureColor').classList.remove('active')
  document.querySelector('.tip').classList.remove('active')
  document.querySelector('.btn-auto-draw').classList.remove('active')
}

function onAutoDraw() {
  document.querySelector('.btn-auto-draw').classList.add('active')
  autoDrawer = new AutoDrawer()
}
function onChooseSize(num) {
  document.querySelectorAll('.size button').forEach(x => {
    x.classList.remove('active')
  })
  document.querySelector('#x' + num).classList.add('active')
  GAME.size = num
}

// Right Position
function initRightElement() {
  let x = width - 200

  // Shaping Button
  select('.shape-container').style('left', x + 'px');

  document.querySelector('#shapeBtn').addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return

    GAME.shape = e.target.dataset.value

    // Pressed Button
    document.querySelectorAll('#shapeBtn button').forEach(x => {
      x.classList.remove('active')
    })

    e.target.classList.add('active')
  })

  // Color
  select('.color-container').style('left', x + 'px');
  document.querySelector('#pureColor').addEventListener('click', function () {
    document.querySelector('#colorPicker').click()

    // Edit Select
    document.querySelector('#gradientColor').classList.remove('active')
    this.classList.add('active')
  })
  document.querySelector('#gradientColor').addEventListener('click', function () {
    GAME.color = [
      [random(255), random(255), random(255)],
      [random(255), random(255), random(255)]
    ]

    // Edit Selected
    document.querySelector('#pureColor').classList.remove('active')
    this.classList.add('active')
  })

  document.querySelector('#colorPicker').addEventListener('change', function () {
    GAME.color = [this.value, this.value]
  })

  select('.word-container').style('left', x + 'px');

  //Restart Button
  select('.bottom-container').style('left', x + 'px');

}

// 中间的钟表区域
function clock() {
  const tick = 5 // 刻度线长度 每个刻度15度

  const cx = width / 2
  const cy = height / 2
  noStroke()
  fill(255) //刻度颜色!!!!!!!!!!!!!!!!!!!!!!!

  text('0', cx - 3, cy - clock_r - 20)
  text('90', cx + clock_r + 20, cy + 3)
  text('180', cx - 9, cy + clock_r + 26)
  text('270', cx - clock_r - 38, cy + 3)

  push()
  stroke(255)

  translate(width / 2, height / 2)
  rotate(-90)

  for (let i = 0; i < 24; i++) {

    if (i % 6 == 0) { // 每6个刻度
      strokeWeight(2)
      line(clock_r - tick, 0, clock_r + 2 * tick, 0)
    } else {
      strokeWeight(1)
      line(clock_r, 0, clock_r + tick, 0)
    }

    rotate(15)
  }

  pop()
}