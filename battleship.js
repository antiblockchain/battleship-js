
const optionContainer = document.getElementById("option-container");
const gamesboardContainer = document.getElementById('gameboard-container');
const flipButton = document.getElementById("flip-button");
const startButton = document.getElementById("start-button");
const infoDisplay = document.querySelector('#info');
const turnDisplay = document.querySelector('#turn-display')

let previewAngle = 0;
flipButton.addEventListener('click', () => {
    const optionShips = Array.from(optionContainer.children);
    if (previewAngle == 0) {
        previewAngle = 90;
    } else previewAngle = 0;
    optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${previewAngle}deg)`);
})

const gridSize = 10;


function generateBoard (color, user) {
    const gameboardContainer = document.createElement('div');
    gameboardContainer.classList.add('game-board');
    gameboardContainer.style.backgroundColor = color;
    gameboardContainer.id = user;
    gamesboardContainer.append(gameboardContainer);

    for (let i = 0; i < gridSize * gridSize; i++) {
        const block = document.createElement('div');
        block.classList.add('block');
        block.id = i;
        gameboardContainer.append(block);

    }
}
generateBoard('red', 'player');
generateBoard('purple', 'computer');





class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
    }
}

const destroyer = new Ship('destroyer', 2);
const submarine = new Ship ('submarine', 3);
const cruiser = new Ship ('cruiser', 3);
const battleship = new Ship ('battleship', 4);
const carrier = new Ship ('carrier', 5);

const ships = [destroyer, submarine, cruiser, battleship, carrier];

let notDropped = true;

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStart = isHorizontal ? startIndex <= gridSize * gridSize - ship.length ? startIndex : gridSize * gridSize - ship.length :
    startIndex <= gridSize * gridSize * ship.length ? startIndex : startIndex - ship.length * gridSize + gridSize;

    let shipBlocks = [];

    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i]);
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * gridSize]);
        }
    }
    let valid = true;
    if (isHorizontal) {
    shipBlocks.every((_shipBlock, index) => valid = shipBlocks[0].id % gridSize !== gridSize - (shipBlocks.length - (index + 1)));
    } else {
        shipBlocks.every((_shipBlock, index) => valid = shipBlocks[0].id < 90 + (gridSize * index + 1));
    }

    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'));
    return { shipBlocks, valid, notTaken};

}

function addShip(user, ship, startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`);
    let randomBool = Math.random() < 0.5;
    let isHorizontal = user === 'player' ? angle === 0 : randomBool;
    let randomStartIndex = Math.floor(Math.random() * gridSize * gridSize);

    let startIndex = startId ? startId : randomStartIndex;

    const { shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship);

    if (valid && notTaken) {

        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name);
            shipBlock.classList.add('taken');
        })
    } else {
        if (user == 'computer') {
            addShip('computer', ship, startId);
        } if (user == 'player') {
            notDropped = true;
        }
    }


}
ships.forEach(ship => addShip('computer', ship));

let draggedShip = 0;
const optionShips = Array.from(optionContainer.children);

optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart));
const allPlayerBlocks = document.querySelectorAll('#player div');
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver);
    playerBlock.addEventListener('drop', dropShip);
})

function dragStart(e) {
    notDropped = false;
    draggedShip = e.target;
}


function dragOver(e) {
    e.preventDefault();
    const ship = ships[draggedShip.id];
    highlightArea(e.target.id, ship);
}
function dropShip(e) {
    const startId = e.target.id;
    const ship = ships[draggedShip.id];
    addShipPiece('player', ship, startId);
    if (!notDropped) {
        draggedShip.remove();
    }
}

function highlightArea(startIndex, ship) {
    const allBoardBlocks = document.querySelectorAll('#player div');
    let isHorizontal = angle == 0;

    const { shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship);

    if (valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add('hover');
            setTimeout(() => shipBlock.classList.remove('hover'), 500);
        })
    }
}

let gameOver = false;
let playerTurn = false;

function startGame() {
    if(playerTurn == undefined) {
        if(optionContainer.children.length != 0) {
            infoDisplay.textContent = 'Place all pieces';
        } else {
            const allBoardBlocks = document.querySelectorAll('#computer div');
            allBoardBlocks.foreEach(block => block.addEventListener('click', handleClick));
            playerTurn = true;
            turnDisplay.textContent = 'Your turn';
            infoDisplay.textContent = 'The game has started';
        }
    }


}

startButton.addEventListener('click', startGame);

let playerHits = [];
let computerHits = [];
const playerSunkShips = [];
const computerSunkShips = [];

function handleClick(e) {
    if (!gameOver) {
        if (e.target.classList.contains('taken')) {
            e.target.classList.add('boom');
            infoDisplay.textContent = 'Hit!';
            let classes = Array.from(e.target.classList);
            classes = classes.filter(className => className !== 'block');
            classes = classes.filter(className => className !== 'boom');
            classes = classes.filter(className => className !== 'taken');
            playerHits.push(...classes);
            checkScore('player', playerHits, playerSunkShips);
        }
        if (e.target.classList.contain('taken')) {
            infoDisplay.textContent = 'Missed!';
            e.taget.classList.add('empty');
        }
        playerTurn = false;
        const allBoardBlocks = document.querySelectorAll('#computer div');
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)));
        setTimeout(computerGo, 3000);
    }
}

function computerGo() {
    if (!gameOver) {
        turnDisplay.textContent = 'Computers turn';
        infoDisplay.textContent = 'Move computating';

        setTimeout(() => {
            let randomGo = Math.floor(Math.random() * gridSize * gridSize);
            const allBoardBlocks = document.querySelectorAll('#player div');

            if (allBoardBlocks[randomGo].classList.contains('taken') &&
                allBoardBlocks[randomGo].classList.contains('boom')) {
                    computerGo();
                    return;
                } else if (allBoardBlocks[randomGo].classList.contains('taken') &&
                        !allBoardBlocks[randomGo].classList.contains('boom')) {
                            allBoardBlocks[randomGo].classList.add('boom');
                            infoDisplay.textContent = 'Its a hit!';
                            let classes = Array.from(allBoardBlocks[randomGo].classList);
                            classes = classes.filter(className => className !== 'block');
                            classes = classes.filter(className => className !== 'boom');
                            classes = classes.filter(className => className !== 'taken');
                            computerHits.push(...classes);
                            checkScore('computer', computerHits, computerSunkShips);
                        } else {
                            infoDisplay.textContent = 'Its a miss!';
                            allBoardBlocks[randomGo].classList.add('empty');
                        }
        }, 3000)

        setTimeout(() => {
            playerTurn = true;
            turnDisplay.textContent = 'Your turn';
            infoDisplay.textContent = 'Play';
            const allBoardBlocks = document.querySelectorAll('#computer div');
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick));
        }, 6000)
    }
}
function checkScore(user, userHits, userSunkShips) {
    function checkShip(shipName, shipLength) {
        if (userHits.filter(storedShipName => storedShipName === shipName).length === shipLength) {
            infoDisplay.textContent = `You sunk the ${user}s ${shipName}`;
            if (user === 'player') {
                playerHits = userHits.filter(storedShipName => storedShipName !== shipName);
            }
            if (user === 'computer') {
                computerHits = userHits.filter(storedShipName => storedShipName !== shipName);
            }
            userSunkShips.push(shipName);
        }
    }
    if(playerSunkShips.length == 5) {
        infoDisplay.textContent = 'You won!';
        gameOver = true;
    }
    if(computerSunkShips.length == 5) {
        infoDisplay.textContent = 'You lost!';
        gameOver = true;
    }

}