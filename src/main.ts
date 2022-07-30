import kaboom, { Vec2 } from "kaboom";

kaboom();


const PADDING = 64;

const RECT_HEIGHT = height() - 2*PADDING;

const sumVec = (a: Vec2, b: Vec2) => {
  return vec2(a.x + b.x, a.y + b.y);  
}

const sumVecArr = (arr: Vec2[]) => {
  return arr.reduce((acc, cur) => sumVec(acc, cur), vec2(0, 0))
}

const transpose = (m: number[][]) => m[0].map((_,i) => m.map(x => x[i]))

const RECT_PADDING = {
    top: (height() - RECT_HEIGHT) / 2,
    left: (width() - RECT_HEIGHT) / 2,
    width: RECT_HEIGHT,
    height: RECT_HEIGHT,
    size () {
      return vec2(this.width, this.height)
    },
    pos () {
      return vec2(this.left, this.top)
    },
    offsetLeft(n: number) {
      const offsetVec = vec2(n * (RECT_HEIGHT / 3), 0)
      return sumVec(this.pos(), offsetVec) 
    },
    offsetTop(n: number) {
      const offsetVec = vec2(0, n * (RECT_HEIGHT / 3))
      return sumVec(this.pos(), offsetVec)
    },
    offset(x: number, y: number) {
      const left = this.left + x * (RECT_HEIGHT / 3)
      const top = this.top + y * (RECT_HEIGHT / 3)
      return vec2(left, top)
    }
}

enum RectState {
  Empty = 0,
  X,
  O,
}

const GAME = {
  world: Array(3).fill(RectState.Empty).map(() => Array(3).fill(RectState.Empty)),
  moveCount: 0,
  get currentPlayer () {
    return this.moveCount % 2 === 0 ? RectState.X : RectState.O
  },

  play (index: Vec2): boolean {
    if (this.world[index.x][index.y] !== RectState.Empty) {
      return false
    }

    this.world[index.x][index.y] = this.currentPlayer
    this.moveCount++

    return true
  },

  checkWin (): void {
    const horizontalCheck = this.world.some(arr => arr.every(val => val === RectState.X) || arr.every(val => val === RectState.O))
    const verticalCheck = transpose(this.world).some(arr => arr.every(val => val === RectState.X) || arr.every(val => val === RectState.O))

    const diagonal1 = [this.world[0][0], this.world[1][1], this.world[2][2]]
    const diagonal2 = [this.world[0][2], this.world[1][1], this.world[2][0]]

    const diagonalCheck = diagonal1.every(val => val === RectState.X) || diagonal1.every(val => val === RectState.O) || diagonal2.every(val => val === RectState.X) || diagonal2.every(val => val === RectState.O)


    const isWin =  [
      horizontalCheck,
      verticalCheck,
      diagonalCheck,
    ].some(Boolean)

    if (isWin && this.currentPlayer === RectState.X) {
      alert(`O wins!`)
    } else if (isWin && this.currentPlayer === RectState.O) {
      alert(`X wins!`)
    }

    if (this.moveCount === 9 && !isWin) {
      alert(`Draw!`)
    }
  },

  reset (): void {
    this.world = Array(3).fill(RectState.Empty).map(() => Array(3).fill(RectState.Empty))
    this.moveCount = 0

    every("X", destroy)
    every("O", destroy)
  }
}

function createX (position: Vec2) {
  return {
    draw () {
      drawLine({
        p1: position,
        p2: sumVecArr([
          position,
          vec2(RECT_PADDING.width / 3, RECT_PADDING.width / 3),
        ]),
        color: BLACK,
        width: 8,
      })

      drawLine({
        p1: sumVecArr([
          position,
          vec2(0, RECT_PADDING.width / 3),
        ]),
        p2: sumVecArr([
          position,
          vec2(RECT_PADDING.width / 3, 0),
        ]),
        color: BLACK,
        width: 8,
      })
    }
  }
}

function createO (position: Vec2) {
  return {
    draw () {
      drawCircle({
        pos: sumVecArr([
          position,
          vec2(RECT_PADDING.width / 6, RECT_PADDING.width / 6),
        ]),
        radius: RECT_PADDING.width / 7,
        opacity: 0,
        outline: { color: BLACK, width: 8 },
      })
    }
  }
}

function createRect (index: Vec2, position: Vec2, w: number, h: number) {
  const pRect = add([
    pos(position),
    rect(w, h),
    outline(16),
    area({ cursor: "pointer" }),
    color(WHITE),
    opacity(0),
    `rect_${position.x}_${position.y}`,
  ])

  pRect.onClick(() => {
    const currentPlayer = GAME.currentPlayer

    if (GAME.play(index)) {
      if (currentPlayer === RectState.X) {
        add([
          createX(position),
          "X"
        ])
      } else {
        add([
          createO(position),
          "O",
        ])
      }

      GAME.checkWin()
    }
  })

  return pRect
}

function grid () {
    return {
        add () {
          for (let i = 0; i < 3 ; i++) {
            for (let j = 0; j < 3; j++) {
              createRect(
                vec2(i, j),
                RECT_PADDING.offset(i, j), 
                RECT_HEIGHT / 3, 
                RECT_HEIGHT / 3
              )
            }
          }
        },
    }
}


function addButton(txt: string, p: Vec2, f: () => void) {

	const btn = add([
		text(txt),
		pos(p),
		area({ cursor: "pointer", }),
		scale(1),
	])

	btn.onClick(f)
}

add([
  grid(),
  addButton("Reset", vec2(64, 64), () => {
    console.log("reset")
    GAME.reset()
  }),
  ])