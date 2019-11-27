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
    this.pieces = [
      { name: 'i-block', coords: [{x:3, y:-1}, {x:4, y:-1}, {x:5, y:-1}, {x:6, y:-1}], color: '#00f0ef', length: 4 },
      { name: 'j-block', coords: [{x:3, y:-2}, {x:3, y:-1}, {x:4, y:-1}, {x:5, y:-1}], color: '#1300e6', length: 3 },
      { name: 'l-block', coords: [{x:3, y:-1}, {x:4, y:-1}, {x:5, y:-1}, {x:5, y:-2}], color: '#f09f01', length: 3 },
      { name: 'o-block', coords: [{x:4, y:-2}, {x:4, y:-1}, {x:5, y:-2}, {x:5, y:-1}], color: '#f0ef00', length: 2 },
      { name: 's-block', coords: [{x:3, y:-1}, {x:4, y:-1}, {x:4, y:-2}, {x:5, y:-2}], color: '#00f000', length: 3 },
      { name: 't-block', coords: [{x:3, y:-1}, {x:4, y:-1}, {x:4, y:-2}, {x:5, y:-1}], color: '#a000f0', length: 3 },
      { name: 'z-block', coords: [{x:3, y:-2}, {x:4, y:-2}, {x:4, y:-1}, {x:5, y:-1}], color: '#f00000', length: 3 }
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
      if (e.key === 'ArrowUp') gamepiece.handleMove('up');
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

    // loop through game peice's coords and add a block at each coordinate on the board
    for (let i=0; i<4; i++) {
      const div = document.createElement('div');
      div.classList.add('block');
      div.classList.add('active')
      div.classList.add('hidden');
      div.style.top = this.activeGamePiece.coords[i].y * 40 + 'px';
      div.style.left = this.activeGamePiece.coords[i].x * 40 + 'px';
      div.style.backgroundColor = this.activeGamePiece.color;
      div.setAttribute('data-x', this.activeGamePiece.coords[i].x);
      div.setAttribute('data-y', this.activeGamePiece.coords[i].y);
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
      div.style.top = (this.nextGamePiece.coords[i].y * 40 + 80) + topAdjustment + 'px';
      div.style.left = (this.nextGamePiece.coords[i].x * 40 - 80) + leftAdjustment + 'px';
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