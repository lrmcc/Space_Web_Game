const shipInitX = 200;
const shipMinX = -160;
const shipMaxX = 560;
const shipInitY = 220;
const shipMinY = -60;
const shipMaxY = 270;
const shipComponents = ['ship-nose', 'ship-body','ship-wing-left','ship-wing-right', 'ship-tail','ship-tail-fire','ship-tail-fire'];

const UfoMinX = -180;
const UfoMaxX = 530;
const UfoResetX = [-179, -38, 104, 246, 388, 529]
const UfoComponents = ['ufo-glass', 'ufo-alien','ufo-alien-eye-left','ufo-alien-eye-right', 'ufo-alien-body','ufo-top','ufo-body-upper', 'ufo-body-lower','ufo-antenna-pole','ufo-antenna-base','ufo-antenna-bead'];

const laserMinY = -100;
// const laserMaxY = 270; This is the max Y value for container, may use later.
const numLasersCreate = 5;

const numStarsCreate = 16;

let gameInProgress = false;
let time = 60;
let score = 0;
// let keyPress = '';

let shipX = 200;
let shipY = 220;

let UfoX = -180;
let UfoY = -60;
let UfoDirection = 1;
let UfoHit = false;

let laserX = 246;
let laserY = 160;
let laserIDsActive = [];
let laserIsMoving = false;

let numStars = 0;

/**
 * Starts the background animation by adding stars.
 */
const startBackgroundAnimation = () => {
    for(let i = 0; i < numStarsCreate; i++){
        addStar(`star${i}`);
    }
}

/**
 * Starts the game by initializing Ship, Lasers, UFOs, clearing the score and starting the timer. 
 */
const startGame = () => {
    if (!gameInProgress){
        console.log("Starting game");
        setScore(0);
        removeStartButton();
        initShip();
        initUfo();
        startTimer();
        document.onkeydown = checkKey;
    }
    gameInProgress = true;
}

/**
 * Starts timer.
 */
const startTimer = async () => {
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
const addStar = (starID) => {
    appendChildToParent(createElement('div', starID, ['star']), 'graphics');
    let star = document.getElementById(starID);
    let starTime = getStarTime();
    setStarStyles(star, starTime, getStarXValue());
    setTimeout(() => {resetStarStyles(star)}, Math.floor(starTime * 1000));
    numStars++;
}

/**
 * Sets star CSS values.
 * @param {*} star 
 * @param {*} starTime 
 * @param {*} starXValue 
 */
const setStarStyles = (star, starTime, starXValue) => {
    star.style.setProperty('--star-time', starTime +'s');
    star.style.setProperty("--star-translateX", starXValue + "px");
}

/**
 * Resets star CSS values.
 * @param {*} star 
 */
const resetStarStyles = (star) => {
    let starTime = getStarTime();
    setStarStyles(star, starTime, getStarXValue());
    setTimeout(() => {resetStarStyles(star)}, Math.floor(starTime * 1000));
}

/**
 * Initializes Ship by appending elements to graphics container.
 */
const initShip = () => {
    console.log("Initializing Ship");
    initShipPosition();
    initLasers();
    
    appendChildToParent(createElement('div', 'ship-container', []), 'graphics');
    appendChildToParent(createElement('div', 'ship-wrapper', []), 'ship-container');
    appendChildToParent(createElement('div', 'ship', []), 'ship-wrapper');
    for(let i = 0; i < shipComponents.length; i++){
        appendChildToParent(createElement('div', shipComponents[i], ['ship-component']), 'ship');
    }
}

/**
 * Initializes the Ship's position.
 */
const initShipPosition = () => {
    setCssRootValue('--ship-translateX', shipInitX, 'px');
    setCssRootValue('--ship-translateY', shipInitY, 'px');
}

/**
 * Initializes the ships lasers.
 * @param {*} laserID 
 */
const initLasers = (laserID) => { 
    for(let i = 0; i < numLasersCreate; i++){
        appendChildToParent(createElement('div', `laser${i}`, ['laser']), 'graphics');
    }
}

/**
 * Allows the ship to move.
 */
const shipMove = () => {
    let shipContainer = document.getElementById('ship-container');
    shipContainer.style.transform = `translate(${shipX}px, ${shipY}px)`;
    console.log("shipContainer.style.transform: " + shipContainer.style.transform);
    let shipTailFire = document.getElementById('ship-tail-fire');
    shipFireOn(shipTailFire);
    setTimeout(shipFireOff(shipTailFire), 100);
}

/**
 * Initializes UFO by add needed elements to graphics container.
 */
const initUfo = () => {
    // Using `${i}` syntax for future implementation of multiple UFOs
    appendChildToParent(createElement('div', `ufo-container${0}`, ['ufo-container']), 'graphics');
    appendChildToParent(createElement('div', `ufo${0}`, ['ufo']), `ufo-container${0}`);
    for(let j = 0; j < UfoComponents.length; j++) {
        appendChildToParent(createElement('div', `${UfoComponents[j]}${0}`, [UfoComponents[j], 'ufo-component']),`ufo${0}`);
    }
    let UfoContainer = document.getElementById(`ufo-container${0}`);
    setUfoPosition(UfoContainer);
    activateUfo(UfoContainer);
}

/**
 * Activates the UFO animation.
 * @param {*} UfoContainer 
 */
const activateUfo = (UfoContainer) => {
    let id = setInterval(frame, 10);
    async function frame() {
        if (UfoX == UfoMaxX) {
            UfoDirection = -1;
        } else if (UfoX == UfoMinX){
            UfoDirection = 1;
        } else if (UfoHit){
            UfoHit = 0;
            UfoContainer.style.opacity = '0';
            setScore(++score);
            clearInterval(id);
            await sleep(Math.floor(Math.random() * 6000));
            UfoX = UfoResetX[Math.floor(Math.random() * 6)];
            setUfoPosition(UfoContainer);
            UfoContainer.style.opacity = '1';
            activateUfo(UfoContainer);
        }
        UfoX += UfoDirection;
        setUfoPosition(UfoContainer);
    }
}

/**
 * Activates the laser to fire.
 */
const fireLaser = async () => {
    let laserIDNumber = laserIDsActive.length;
    let laserID = `laser${laserIDNumber}`
    let laser = document.getElementById(laserID);
    activateFireLaser(laser);
    checkLaserHit(laser);
    laserIDsActive.push(laserIDNumber);
    await sleep(2000);
    laserIDsActive.shift();
 }

 /**
  * Activate the laser's animation.
  * @param {*} laser 
  */
const activateFireLaser = (laser) => {
    laserX = shipX + 48;
    laserY = shipY;
    laserIsMoving = true;
    laser.style.opacity = '1';
    let id = setInterval(frame, 5);
    function frame() {
        if (laserY == laserMinY) {
            laserIsMoving = false;
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
const checkLaserHit = async (laser) => {
    while(laserIsMoving){
        await sleep(10);
        if(laserX > (UfoX) && laserX < (UfoX+100)){
            console.log("x-HIT")
            if(laserY < (UfoY+20) && laserY > (UfoY-50)){
                //console.log("laserX: " + laserX);
                //console.log("UFOX: " + UFOX);
                //console.log("laserY: " + laserY);
                //console.log("UFOY: " + UFOY);
                console.log("y-HIT!");
                laserIsMoving = false;
                UfoHit = true;
            }
        }
    }
};

const createElement = (elemType, elemId, elemClassList) => {
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
const appendChildToParent = (childElem, parentId) => {
    let parentElem = document.getElementById(parentId);
    parentElem.appendChild(childElem);
}

/**
 * Checks the value of the key pressed.
 * @param {*} e 
 */
const checkKey = (e) => {
    e = e || window.event;
    let keyPress = e.keyCode;
    console.log(keyPress);
    switch(keyPress) {
        case 37:
            if (shipX > shipMinX) {
                shipX = shipX - 40;
                break;
            }
        case 38:
            if (shipY > shipMinY) {
                shipY = shipY - 40;
                break;
            }
        case 39:
            if (shipX < shipMaxX) {
                shipX = shipX + 40;
                break;
            }
        case 40:
            if (shipY < shipMaxY) {
                shipY = shipY + 40;
                break;
            }
        default:
            if (keyPress == 32){
                console.log("pressed spacebar");
                if (laserIDsActive.length < 5) fireLaser();
                else console.log("Max lasers deployed");    
            }
    }
    if (keyPress == 37 || keyPress == 38 ||keyPress == 39 ||keyPress == 40) {shipMove();}
}

/**
 * Ends the game by removing 
 */
const quitGame = () => {
    console.log("quitting game");
    let graphicsContainer = document.querySelector('.graphics');
    while (graphicsContainer.lastElementChild) {
        graphicsContainer.removeChild(graphicsContainer.lastElementChild);
    }
    document.onkeydown = null;
    numStars = 0;
    gameInProgress = false;
    startBackgroundAnimation();
    time = 0;
    document.getElementById('game-time-value').innerText = time;
    addStartButton();
}

/**
 * Adds Start button
 */
const addStartButton = () => {
    let startButton = createElement("button", "startButton", ["start-button", "game-text"]);
    startButton.setAttribute("type", "button");
    startButton.setAttribute("onClick", "startGame()");
    startButton.innerText="Start";
    appendChildToParent(startButton, "start-button-container");
}

/**
 * Sets the value of the score.
 */

const setScore = (score) => { document.getElementById('game-score-value').innerText = score;}

 /**
  * Moves the UFO.
  * @param {*} UfoContainer 
  */
const setUfoPosition = (UfoContainer) => {UfoContainer.style.transform = `translate(${UfoX}px, ${UfoY}px)`;}

/**
 * Sets the CSS value for a desired element.
 * @param {*} varName 
 * @param {*} value 
 * @param {*} valueString 
 */
const setCssRootValue = (varName, value, valueString)  => {document.documentElement.style.setProperty(`${varName}`, value + valueString);}  

/**
 * Sleeps for a given amount of milliseconds.
 * @param {*} ms 
 * @returns 
 */
const sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms));}

/**
 * Determines the star speed.
 * @returns number used to set star speed.
 */
const getStarTime = () => {return 10 * Math.random() + 3; }

 /**
  * Determines the star X-coordinate value.
  * @returns number used to set star X position.
  */
const getStarXValue = () => { return Math.random() * (880 - (-80)) + -80;}

 /**
 * Toggles the ships tail fire on.
 * @param {*} shipTailFire 
 */
const shipFireOn = (shipTailFire) => {shipTailFire.style.visibility = "visible";}

/**
 * Toggles the ships tail fire off.
 * @param {*} shipTailFire 
 */
const shipFireOff = (shipTailFire) => {shipTailFire.style.visibility = "hidden";}
 
/**
 * Removes Start button
 */
const removeStartButton = () => {document.getElementById('startButton').remove();}

 /**
  * TODO: Pauses game.
  */
const pauseGame = () => {
 }