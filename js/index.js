/**
 * Tetris
 *
 * Main Class to setup the game
 */
class Tetris {
  constructor() {
    this.gameboard = document.getElementById('gameboard');
    this.nextPiece = document.getElementById('nextPiece');
    this.activeGamePiece;
    this.level = 1;
    this.score = 0;
    // setup game pieces and coordinates based on json data
    // since this program is not running on a server, the data will be here for now
    const data = {
      i: [
        [{x:3, y:-1},{x:4, y:-1},{x:5, y:-1},{x:6, y:-1}],
        [{x:3, y:-1},{x:3, y:0},{x:3, y:1},{x:3, y:2}]
      ],
      j: [
        [{x:3, y:-2},{x:4, y:-2},{x:5, y:-2},{x:5, y:-1}],
        [{x:4, y:-2},{x:4, y:-1},{x:4, y:0},{x:3, y:0}],
        [{x:3, y:-2},{x:3, y:-1},{x:4, y:-1},{x:5, y:-1}],
        [{x:3, y:-2},{x:3, y:-1},{x:3, y:0},{x:4, y:-2}]
      ],
      l: [
        [{x:3, y:-2},{x:4, y:-2},{x:5, y:-2},{x:5, y:-1}],
        [{x:3, y:-2},{x:4, y:-2},{x:4, y:-1},{x:4, y:0}],
        [{x:3, y:-1},{x:4, y:-1},{x:5, y:-1},{x:3, y:-2}],
        [{x:3, y:-2},{x:3, y:-1}, {x:3, y:0},{x:4, y:0}]
      ],
      o: [
        [{x:4, y:-2},{x:4, y:-1},{x:5, y:-2},{x:5, y:-1}]
      ],
      s: [
        [{x:4, y:-2},{x:5, y:-2},{x:3, y:-1},{x:4, y:-1}],
        [{x:3, y: -2},{x:3, y: -1},{x:4, y:-1},{x:4, y:0}]
      ],
      t: [
        [{x:3, y:-2},{x:4, y:-2},{x:5, y:-2},{x:4, y:-1}],
        [{x:4, y:-2},{x:4, y:-1},{x:4, y:0},{x:3, y:-1}],
        [{x:4, y: -2},{x:3, y:-1},{x:4, y:-1},{x:5, y:-1}],
        [{x:3, y: -2},{x:3, y:-1},{x:3, y:0},{x:4, y:-1}]
      ],
      z: [
        [{x:3, y:-2},{x:4, y:-2},{x:4, y:-1},{x:5, y:-1}],
        [{x:4, y:-2},{x:4, y:-1},{x:3, y:-1},{x:3, y:0}]
      ]
    };
    this.pieces = [
      { name: 'i-block', coords: data.i, color: '#00f0ef', length: 4, x: 0, y: 0, pos: 0 },
      { name: 'j-block', coords: data.j, color: '#1300e6', length: 3, x: 0, y: 0, pos: 0 },
      { name: 'l-block', coords: data.l, color: '#f09f01', length: 3, x: 0, y: 0, pos: 0 },
      { name: 'o-block', coords: data.o, color: '#f0ef00', length: 2, x: 0, y: 0, pos: 0 },
      { name: 's-block', coords: data.s, color: '#00f000', length: 3, x: 0, y: 0, pos: 0 },
      { name: 't-block', coords: data.t, color: '#a000f0', length: 3, x: 0, y: 0, pos: 0 },
      { name: 'z-block', coords: data.z, color: '#f00000', length: 3, x: 0, y: 0, pos: 0 }
    ];
    this.nextGamePiece = this.generateRandomGamePiece();
  }
  generateRandomGamePiece = () => {
    return this.pieces[Math.floor(Math.random()*this.pieces.length)];
  }
  setupGameBoard = () => {
    for (let i=0; i<10; i++) {
      for (let j=0; j<20; j++) {
        const div = document.createElement('div');
        div.classList.add('block');
        div.setAttribute('data-x', i);
        div.setAttribute('data-y', j);
        div.style.top = j * 40 + 'px';
        div.style.left = i * 40 + 'px';
        this.gameboard.appendChild(div);
      }
    }
  }
  setupSpeedControl = (handleMove) => {
    // set timer for the current level
    let timer = 60;
    window.interval = setInterval(() => {
      let countdown = document.getElementById('countdown');
      if (timer !== 0) {
        timer--;
        let check = '';
        if (timer < 10) check = '0';
        countdown.innerText = '00:' + check + timer;
      } else {
        timer = 60;
        this.level = this.level + 1;
        document.getElementById('level').innerText = this.level;
        countdown.innerText = '01:00';
        clearInterval(window.interval);
        clearInterval(window.interval2);
        this.setupSpeedControl(handleMove);
      }
    }, 1000);

    window.interval2 = setInterval(() => {
      handleMove('down', true);
    }, 1000 / this.level);
  }
  start = () => {
    // insert 40px x 40px blocks into the gameboard
    this.setupGameBoard();
    // add an active gamepiece
    const gamepiece = new GamePiece();
    gamepiece.addActiveGamePiece();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') gamepiece.handleMove('left');
      if (e.key === 'ArrowRight') gamepiece.handleMove('right');
      if (e.key === 'ArrowUp') gamepiece.flipActiveGamePiece();
      if (e.key === 'ArrowDown') gamepiece.handleMove('down');
    });

    this.setupSpeedControl(gamepiece.handleMove);
  }
  gameover = () => {
    clearInterval(window.interval);
    clearInterval(window.interval2);
    const placedBlocks = document.querySelectorAll('.block');
    placedBlocks.forEach((block) => {
      if (block.getAttribute('placed'))
        block.classList.add('gameover');
    });
  }
}
/**
 * GamePiece
 *
 * Adds a new gamepiece onto the board
 */
class GamePiece extends Tetris {
  addActiveGamePiece = () => {
    // randomly choose the next gamepiece
    this.activeGamePiece = this.nextGamePiece;
    // need to safeguard against erratic movement so we'll reset these values here
    this.activeGamePiece.pos = 0;
    this.activeGamePiece.x = 0;
    this.activeGamePiece.y = 0;

    // loop through game peice's coords and add a block at each coordinate on the board
    for (let i=0; i<4; i++) {
      const div = document.createElement('div');
      div.classList.add('block');
      div.classList.add('active')
      div.classList.add('hidden');
      div.style.top = this.activeGamePiece.coords[this.activeGamePiece.pos][i].y * 40 + 'px';
      div.style.left = this.activeGamePiece.coords[this.activeGamePiece.pos][i].x * 40 + 'px';
      div.style.backgroundColor = this.activeGamePiece.color;
      div.setAttribute('data-x', this.activeGamePiece.coords[this.activeGamePiece.pos][i].x);
      div.setAttribute('data-y', this.activeGamePiece.coords[this.activeGamePiece.pos][i].y);
      this.gameboard.appendChild(div);
    }
    this.addNextGamePiece();
  }
  addNextGamePiece = () => {
    this.nextPiece.innerHTML = '';
    // randomly choose the next gamepiece again
    this.nextGamePiece = this.generateRandomGamePiece();
    let topAdjustment = 0;
    let leftAdjustment = 0;
    // loop through game peice's coords and add a block at each coordinate on the board
    for (let i=0; i<4; i++) {
      const div = document.createElement('div');
      div.classList.add('block');
      // make adjustments for positioning based on the length of the blocks of the piece
      if (this.nextGamePiece.length === 4) {
        leftAdjustment = -20;
        topAdjustment = 40;
      }
      if (this.nextGamePiece.length === 2) {
        leftAdjustment = -20;
        topAdjustment = 60;
      }
      if (this.nextGamePiece.length === 3) {
        topAdjustment = 60;
      }
      div.style.top = (this.nextGamePiece.coords[0][i].y * 40 + 80) + topAdjustment + 'px';
      div.style.left = (this.nextGamePiece.coords[0][i].x * 40 - 80) + leftAdjustment + 'px';
      div.style.backgroundColor = this.nextGamePiece.color;
      this.nextPiece.appendChild(div);
    }
  }
  checkCollision = (x, y, direction) => {
    let check;
    // check based on direction if there was a block that was placed there previously and prevent movement if true
    switch (direction) {
      case 'left':
        if (document.querySelector('[data-x="' + (x - 1) + '"][data-y="' + y + '"][placed=true]'))
          return false;
        break;
      case 'right':
        if (document.querySelector('[data-x="' + (x + 1) + '"][data-y="' + y + '"][placed=true]'))
          return false;
        break;
      case 'down':
        if (document.querySelector('[data-x="' + x + '"][data-y="' + (y + 1) + '"][placed=true]'))
          return false;
    }
    return true;
  }
  handleMove = (direction, speedControl) => {
    let successfulMove = true;
    const activeBlocks = document.querySelectorAll('.active');

    // loop through blocks in the active piece and based on the direction determine whether there are collisions or if the piece went outside the game boundaries.
    // If no collisions and it is within the boundaries, adjust positioning based on keyboard directional
    for (const block of activeBlocks) {
      const x = parseInt(block.getAttribute('data-x'), 10);
      const y = parseInt(block.getAttribute('data-y'), 10);

      // if the block went outside the game boundary set successfulMove to false
      if ((x === 0 && direction === 'left') || (y === 19 && direction === 'down') || (x === 9 && direction === 'right') || (!this.checkCollision(x, y, direction))) {
        successfulMove = false;
        continue;
      }
    };

    if (successfulMove)
      this.moveBlocks(activeBlocks, direction);
    else if (speedControl)
      this.newGamePiece(activeBlocks);
  }
  moveBlocks = (activeBlocks, direction) => {
    for (const block of activeBlocks) {
      let x =  parseInt(block.getAttribute('data-x'), 10);
      let y =  parseInt(block.getAttribute('data-y'), 10);

      // remove class hidden if user started moving down even once
      if (block.classList.contains('hidden') && direction === 'down' && y !== -2)
        block.classList.remove('hidden');

      switch (direction) {
        case 'left':
          block.style.left = parseInt(block.style.left, 10) + -40 + 'px';
          block.setAttribute('data-x', x - 1);
          break;
        case 'right':
          block.style.left = parseInt(block.style.left, 10) + 40 + 'px';
          block.setAttribute('data-x', x + 1);
          break;
        case 'down':
          block.style.top = parseInt(block.style.top, 10) + 40 + 'px';
          block.setAttribute('data-y', y + 1);
      }
    }

    // adjust for flipping the activeGamePiece x and y
    switch (direction) {
      case 'left':
        this.activeGamePiece.x--;
        break;
      case 'right':
        this.activeGamePiece.x++;
        break;
      case 'down':
        this.activeGamePiece.y++;

      this.checkRowsForScoring();
    }
  }
  flipActiveGamePiece = () => {
    const activeBlocks = document.querySelectorAll('.active');
    const numOfPositions = this.activeGamePiece.coords.length;
    // if there is another position available, change position on active game piece otherwise reset back to 0
    if ((numOfPositions - 1) > this.activeGamePiece.pos) {
      this.activeGamePiece.pos++;
    } else {
      this.activeGamePiece.pos = 0;
    }

    // check for collisions to make sure flip is viable
    for (let i=0; i<4; i++) {
      const x = this.activeGamePiece.coords[this.activeGamePiece.pos][i].x + this.activeGamePiece.x;
      const y = this.activeGamePiece.coords[this.activeGamePiece.pos][i].y + this.activeGamePiece.y;
      if (x < 0 || x > 9 || y > 19 || document.querySelector('[data-x="' + x + '"][data-y="' + y + '"][placed=true]')) return;
    }
    activeBlocks.forEach((block) => block.remove());

    // loop through game peice's coords and add a block at each coordinate on the board
    for (let i=0; i<4; i++) {
      const div = document.createElement('div');
      div.classList.add('block');
      div.classList.add('active')
      div.style.top = this.activeGamePiece.coords[this.activeGamePiece.pos][i].y * 40 + (40 * this.activeGamePiece.y) + 'px';
      div.style.left = this.activeGamePiece.coords[this.activeGamePiece.pos][i].x * 40 + (40 * this.activeGamePiece.x) + 'px';
      div.style.backgroundColor = this.activeGamePiece.color;
      const x = this.activeGamePiece.coords[this.activeGamePiece.pos][i].x + this.activeGamePiece.x;
      const y = this.activeGamePiece.coords[this.activeGamePiece.pos][i].y + this.activeGamePiece.y;
      div.setAttribute('data-x', x);
      div.setAttribute('data-y', y);
      if (y < 0)
        div.classList.add('hidden');
      this.gameboard.appendChild(div);
    }
  }
  checkRowsForScoring = () => {
    let scoreRows = [];
    // first check and see if there are any full block rows and then remove them, adjust all blocks down that need to, and adjust score
    for (let i=0; i<20; i++) {
      let count = 0;
      for (let j=0; j<10; j++) {
        if (document.querySelector('[data-x="' + j + '"][data-y="' + i + '"][placed=true]')) {
          count++;
          // if the count reached the max in the row, then score!
          if (count === 10) {
            scoreRows.push(i);
            this.score++;
            document.getElementById('score').innerText = this.score;
          }
        }
      }
    }
    scoreRows.sort();

    scoreRows.forEach((y) => {
      this.handleScore(y);
    })
  }
  handleScore = (y) => {
    for (let i=0; i<10; i++) {
      document.querySelector('[data-x="' + i + '"][data-y="' + y + '"][placed=true]').remove();
    }
    const placedBlocks = document.querySelectorAll('[placed=true]');
    placedBlocks.forEach((block) => {
      let dataX =  parseInt(block.getAttribute('data-x'), 10);
      let dataY =  parseInt(block.getAttribute('data-y'), 10);

      if (dataY < y) {
        block.setAttribute('data-y', dataY + 1);
        block.style.top = (dataY + 1) * 40 + 'px';
      }
    });
  }
  newGamePiece = (activeBlocks) => {
    let gameover = false;

    for (const block of activeBlocks) {
      block.classList.remove('active');
      block.setAttribute('placed', true);
      if (parseInt(block.getAttribute('data-y'), 10) === -1) {
        gameover = true;
      }
    }

    if (gameover)
      this.gameover();
    else
      this.addActiveGamePiece();
  }
}

const game = new Tetris();
game.start();
