let keyPress = '';
let gameInProgress = false;
let time = 60;
let score = 0;

let shipX = 200;
let shipY = 220;
let shipMinX = -160;
let shipMaxX = 560;
let shipMinY = -60;
let shipMaxY = 270;

let numStarsCreate = 16;
let numStarsActive = 0;

let UFOX = -180;
let UFOMinX = -180;
let UFOMaxX = 530;
let UFOY = -60;
let UFODirection = 1;

let UFOResetX = [-179, -38, 104, 246, 388, 529]
let UFOElementID = '';
let UFOHit = false;

let numberLasersCreate = 5;
let laserX = 246;
let laserY = 160;
let laserMinY = -100;
// let laserMaxY = 270; This is the max Y value for container, may use later.
let laserIDsActive = [];
let laserIsMoving = 0;

let shipComponentents = ['ship-nose', 'ship-body','ship-wing-left','ship-wing-right', 'ship-tail','ship-tail-fire','ship-tail-fire'];
let UFOComponents = ['ufo-glass', 'ufo-alien','ufo-alien-eye-left','ufo-alien-eye-right', 'ufo-alien-body','ufo-top','ufo-body-upper', 'ufo-body-lower','ufo-antenna-pole','ufo-antenna-base','ufo-antenna-bead'];

/**
 * Starts the background animation by adding stars.
 */
function startBackgroundAnimation() {
    for(let i = 0; i < numStarsCreate; i++){
        addStar(`star${i}`);
    }
}

/**
 * Starts the game by initializing Ship, Lasers, UFOs, clearing the score and starting the timer. 
 */
function startGame() {
    if (!gameInProgress){
        console.log("Starting game");
        document.getElementById('startButton').remove();
        setScore(0);
        initShipPosition();
        initShip();
        initLasers();
        addUFO(1);
        document.onkeydown = checkKey;
        startTimer();
    }
    gameInProgress = true;
}

/**
 * Ends the game by removing 
 */
function quitGame() {
    console.log("quitting game");
    let graphicsContainer = document.querySelector('.graphics');
    while (graphicsContainer.lastElementChild) {
        graphicsContainer.removeChild(graphicsContainer.lastElementChild);
    }
    document.onkeydown = null;
    numStarsActive = 0;
    gameInProgress = false;
    startBackgroundAnimation();
    time = 0;
    document.getElementById('game-time-value').innerText = time;
    addStartButton();
}

/**
 * Adds Start button
 */
 function addStartButton() {
    let startButton = createElement("button", "startButton", ["start-button", "game-text"]);
    startButton.setAttribute("type", "button");
    startButton.setAttribute("onClick", "startGame()");
    startButton.innerText="Start";
    appendChildToParent(startButton, "start-button-container");
}

/**
 * TODO: Pauses game.
 */
function pauseGame() {

}

/**
 * Starts timer.
 */
async function startTimer() {
    time = 60;
    let timeElement = document.getElementById('game-time-value');
    while (time > -1){
        timeElement.innerText = time;
        if(time == 0){
            quitGame();
        }
        await sleep(1000);
        time--;
    }
}

/**
 * Adds star to graphics container.
 * @param {*} starID 
 */
function addStar(starID) {
    appendChildToParent(createElement('div', starID, ['star']), 'graphics');
    let star = document.getElementById(starID);
    let starTime = getStarTime();
    setStarStyles(star, starTime, getStarXValue());
    setTimeout(() => {resetStarStyles(star)}, Math.floor(starTime * 1000));
    numStarsActive++;
}

/**
 * Sets star CSS values.
 * @param {*} star 
 * @param {*} starTime 
 * @param {*} starXValue 
 */
function setStarStyles(star, starTime, starXValue) {
    star.style.setProperty('--star-time', starTime +'s');
    star.style.setProperty("--star-translateX", starXValue + "px");
}

/**
 * Resets star CSS values.
 * @param {*} star 
 */
function resetStarStyles(star) {
    let starTime = getStarTime();
    setStarStyles(star, starTime, getStarXValue());
    setTimeout(() => {resetStarStyles(star)}, Math.floor(starTime * 1000));
}

/**
 * Determines the star speed.
 * @returns number used to set star speed.
 */
let getStarTime = () => {return 10 * Math.random() + 3; }

/**
 * Determines the star X-coordinate value.
 * @returns number used to set star X position.
 */
let getStarXValue = () => { return Math.random() * (880 - (-80)) + -80;}

/**
 * Initializes Ship by appending elements to graphics container.
 */
function initShip() {
    console.log("Initializing Ship");
    appendChildToParent(createElement('div', 'ship-container', []), 'graphics');
    appendChildToParent(createElement('div', 'ship-wrapper', []), 'ship-container');
    appendChildToParent(createElement('div', 'ship', []), 'ship-wrapper');
    for(let i = 0; i < shipComponentents.length; i++){
        appendChildToParent(createElement('div', shipComponentents[i], ['ship-component']), 'ship');
    }
}

/**
 * Allows the ship to move.
 */
function shipMove() {
    let shipContainer = document.getElementById('ship-container');
    shipContainer.style.transform = `translate(${shipX}px, ${shipY}px)`;
    console.log("shipContainer.style.transform: " + shipContainer.style.transform);
    let shipTailFire = document.getElementById('ship-tail-fire');
    shipFireOn(shipTailFire);
    setTimeout(shipFireOff(shipTailFire), 100);
}

/**
 * Toggles the ships tail fire on.
 * @param {*} shipTailFire 
 */
let shipFireOn = (shipTailFire) => {shipTailFire.style.visibility = "visible";}

/**
 * Toggles the ships tail fire off.
 * @param {*} shipTailFire 
 */
let shipFireOff = (shipTailFire) => {shipTailFire.style.visibility = "hidden";}

/**
 * Initializes UFOs by add needed elements to graphics container.
 * @param  {Number} numUFOs The number of UFOs to be added.
 */
function addUFO(numUFOs) {
    for (let i = 0; i < numUFOs; i++){
        appendChildToParent(createElement('div', `ufo-container${i}`, ['ufo-container']), 'graphics');
        appendChildToParent(createElement('div', `ufo${i}`, ['ufo']), `ufo-container${i}`);
        for(let j = 0; j < UFOComponents.length; j++){
            appendChildToParent(createElement('div', `${UFOComponents[j]}${i}`, [UFOComponents[j], 'ufo-component']),`ufo${i}`);
        }
        UFOElementID = `ufo-container${i}`;
        let UFOContainer = document.getElementById(UFOElementID);
        setUFOTransform(UFOContainer);
        activateUFOAnimation(UFOContainer);
    }
}

/**
 * Activates the UFO animation.
 * @param {*} UFOContainer 
 */
 function activateUFOAnimation(UFOContainer) {
    let id = setInterval(frame, 10);
    async function frame() {
        if (UFOX == UFOMaxX) {
            UFODirection = -1;
        } else if (UFOX == UFOMinX){
            UFODirection = 1;
        } else if (UFOHit){
            UFOHit = false;
            UFOContainer.style.opacity = '0';
            setScore(++score);
            clearInterval(id);
            await sleep(Math.floor(Math.random() * 6000));
            UFOX = UFOResetX[Math.floor(Math.random() * 6)];
            setUFOTransform(UFOContainer);
            UFOContainer.style.opacity = '1';
            activateUFOAnimation(UFOContainer);
        }
        UFOX += UFODirection;
        setUFOTransform(UFOContainer);
    }
}

/**
 * Initializes the ships lasers.
 * @param {*} laserID 
 */
let initLasers = (laserID) => { 
    for(let i = 0; i < numberLasersCreate; i++){
        appendChildToParent(createElement('div', `laser${i}`, ['laser']), 'graphics');
        }
    }

function createElement(elemType, elemId, elemClassList) {
    let elem = document.createElement(elemType);
    elem.id = elemId;
    if (elemClassList.length > 0) {
        elemClassList.forEach(className => {
            elem.classList.add(className);
        });   
    }
    return elem;
}

/**
 * Appends desired element to the graphics container.
 * @param {*} childElem Element type to be create (i.e. "div" or "button")
 * @param {*} childId Id of child element to create
 * @param {*} childClassList List of strings of class names
 * @param {*} parentId Id of element to append child to
 */
 function appendChildToParent(childElem, parentId) {
    let parentElem = document.getElementById(parentId);
    parentElem.appendChild(childElem);
}

/**
 * Checks the value of the key pressed.
 * @param {*} e 
 */
function checkKey(e) {
    e = e || window.event;
    keyPress = e.keyCode;
    console.log(keyPress);
    if ( keyPress == '38' || keyPress == '40' || keyPress == '37' || keyPress == '39' ){

        if ((keyPress == '38') && (shipY > shipMinY)) {
            shipY = shipY - 40;
        }
        else if ((keyPress == '40') && (shipY < shipMaxY)) {
            shipY = shipY + 40;
        }
        else if ((keyPress == '37') && (shipX > shipMinX)) {
            shipX = shipX - 40;
        }
        else if ((keyPress == '39') && (shipX < shipMaxX)) {
            shipX = shipX + 40;
        }
        shipMove();
    } else if (keyPress = '32'){
        console.log("pressed spacebar");
        if (laserIDsActive.length < 5) fireLaser();
        else console.log("Max lasers deployed");
    }
}

/**
 * Activates the laser to fire.
 */
async function fireLaser() {
    let laserIDNumber = laserIDsActive.length;
    let laserID = `laser${laserIDNumber}`
    let laser = document.getElementById(laserID);
    activateFireLaserAnimation(laser);
    checkLaserHit(laser);
    laserIDsActive.push(laserIDNumber);
    await sleep(2000);
    laserIDsActive.shift();
 }

 /**
  * Activate the laser's animation.
  * @param {*} laser 
  */
 function activateFireLaserAnimation(laser) {
    laserX = shipX + 48;
    laserY = shipY;
    laserIsMoving = 1;
    laser.style.opacity = '1';
    let id = setInterval(frame, 5);
    function frame() {
        if (laserY == laserMinY) {
            laserIsMoving = 0;
            laser.style.opacity = '0';
            clearInterval(id);
        } else {
            laserY--;
            laser.style.transform = `translate(${laserX}px, ${laserY}px)`;
        }
    }
}

/**
 * Checks for a laser hit on the UFO.
 * @param {*} laser 
 */
async function checkLaserHit(laser) {
    while(laserIsMoving){
        await sleep(10);
        if(laserX > (UFOX) && laserX < (UFOX+100)){
            console.log("x-HIT")
            if(laserY < (UFOY+20) && laserY > (UFOY-50)){
                //console.log("laserX: " + laserX);
                //console.log("UFOX: " + UFOX);
                //console.log("laserY: " + laserY);
                //console.log("UFOY: " + UFOY);
                console.log("y-HIT!");
                laserIsMoving = 0;
                UFOHit = true;
            }
        }
    }
};

/**
 * Sets the value of the score.
 */
function setScore(score) {
    document.getElementById('game-score-value').innerText = score;
}

/**
 * Moves the UFO.
 * @param {*} UFOContainer 
 */
function setUFOTransform(UFOContainer) {
    UFOContainer.style.transform = `translate(${UFOX}px, ${UFOY}px)`;
}

/**
 * Initializes the Ship's position.
 */
function initShipPosition() {
    setCssValue('--ship-translateX', shipX, 'px');
    setCssValue('--ship-translateY', shipY, 'px');
}

/**
 * Sets the CSS value for a desired element.
 * @param {*} varName 
 * @param {*} value 
 * @param {*} valueString 
 */
let setCssValue = (varName, value, valueString)  => { 
    document.documentElement.style.setProperty(`${varName}`, value + valueString);
}  

/**
 * Sleep function for a given amount of milliseconds.
 * @param {*} ms 
 * @returns 
 */
let sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms));}
