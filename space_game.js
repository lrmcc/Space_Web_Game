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
const laserMaxY = 270;
const numLasersCreate = 5;

const numStarsCreate = 16;

let gameInProgress = false;
let time = 60;
let score = 0;
let keyPress = '';

let shipX = 200;
let shipY = 220;
let shipContainer;

let UfoX = -180;
let UfoY = -60;
let UfoDirection = 1;
let UfoHit = false;

let numLasersActive = 0;
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
 * Starts the game by initializing Ship, Lasers, Ufos, clearing the score and starting the timer. 
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
    appendChildToParent(createElement('div', 'ship-container', []), 'graphics');
    appendChildToParent(createElement('div', 'ship-wrapper', []), 'ship-container');
    appendChildToParent(createElement('div', 'ship', []), 'ship-wrapper');
    for(let i = 0; i < shipComponents.length; i++){
        appendChildToParent(createElement('div', shipComponents[i], ['ship-component']), 'ship');
    }
    shipContainer = document.getElementById('ship-container');
}

/**
 * Allows the ship to move.
 */
const shipMove = () => {
    
    shipContainer.style.transform = `translate(${shipX}px, ${shipY}px)`;
    console.log(`Ship's position: x=${shipX}, y=${shipY}`);

    // let shipTailFire = document.getElementById('ship-tail-fire');
    // shipFireOn(shipTailFire);
    // setTimeout(shipFireOff(shipTailFire), 100);
}

/**
 * Initializes Ufo by add needed elements to graphics container.
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
 * Activates the Ufo animation.
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
            //TODO: if Ufo hit update update global ufo x,y to offscreen 
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
const fireLaser = async (shipX) => {
    
    let laserX = shipX + 48;
    let laserY = shipY;
    let laser = appendChildToParent(createElement('div', `laser${numLasersActive++}`, ['laser']), 'graphics');
    laser.style.transform = `translate(${laserX}px, ${laserY}px)`;
    
    let id = setInterval(frame, 10);
    function frame() {
        laserY--;
        if (laserY == laserMinY) {
            laser.remove();
            clearInterval(id);
            numLasersActive--;
        } else {
            laser.style.transform = `translate(${laserX}px, ${laserY}px)`;
            if (laserY < (UfoY+20) && laserY > (UfoY-50) && laserX > (UfoX) && laserX < (UfoX+100)) {
                    UfoHit = true;
                }
        }
    }
 }

/**
 * Creates an HTML element based on parameters.
 * @param {} elemType tag type (i.e. div, span, ect.) to create
 * @param {*} elemId id of element created
 * @param {*} elemClassList list of classes to add to element
 * @returns 
 */
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
    return childElem;
}

 /**
  * Tool for logging an element's actual position. Used for development/troubleshooting.
  * @param {*} elem 
  */
  const logElemPosition = (elem) =>{
    const reX = /\d+(?=,\s\d+\))/;
    const reY = /\d+(?=\))/;
    elemTransformVal = window.getComputedStyle(elem).getPropertyValue("transform");
    console.log(`Elem ${elem.id}'s position: " x=${elemTransformVal.match(reX)}, y=${elemTransformVal.match(reY)}`);
}

/**
 * Checks the value of the key pressed.
 * @param {*} e 
 */
const checkKey = (e) => {
    e = e || window.event;
    keyPress = e.keyCode;
    console.log(keyPress);
    switch(keyPress) {
        case 37:
            if (shipX > shipMinX) {shipX -= 40;}
            break;
        case 38:
            if (shipY > shipMinY) {shipY -= 40;}
            break;
        case 39:
            if (shipX < shipMaxX) {shipX += 40;}
            break;
        case 40:
            if (shipY < shipMaxY) {shipY += 40;}
            break;
        default:
            if (keyPress == 32){
                fireLaser(shipX);
            }
    }
    if (keyPress >= 37 && keyPress <= 40) {shipMove();}
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
 * Tool for seting a root CSS variable's value.
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