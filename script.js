const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");
const startButton = document.getElementById("start-btn");
const stopButton = document.getElementById("stop-btn");
const resetButton = document.getElementById("reset-btn");
const focusButton = document.getElementById("focus-btn");
const breakButton = document.getElementById("break-btn");
const longBreakButton = document.getElementById("long-break-btn");
const message = document.getElementById("message");
const timerWindow = document.getElementById("timer-window");
const timerImg = document.getElementById("timer-image");
const timerCloseButton = document.getElementById("timer-close-btn");
const mainWindow = document.getElementById("window");
const moonImgs = ["moon5.png", "moon4.png", "moon3.png", "moon1.png", "moon3.png", "moon4.png"];
const coffeeImgs = ["coffee1.png", "coffee2.png", "coffee3.png", "coffee4.png", "coffee5.png"];
const closeButton = document.getElementById("close-btn");
const desktopButton = document.getElementById("reopen-btn");
const minimizeButton = document.getElementById("minimize-btn");
const timerMinimizeButton = document.getElementById("timer-minimize-btn");

let pomodoroMinutes = 25;
let totalSeconds = pomodoroMinutes * 60;
let timer = null;
let endTime = null;
let audioContext = null;
let timerType = "focus";
let imgLoop = null;
let loopFrame = 1;

function showTime() {
    minutesInput.textContent = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    secondsInput.textContent = String(totalSeconds % 60).padStart(2, "0");
}

function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    stopImgLoop();
}


function start() {
    if (timer) return;
    if (totalSeconds <= 0) return;

    if (!audioContext) audioContext = new AudioContext();
    audioContext.resume();

    message.textContent = "";
    endTime = Date.now() + totalSeconds * 1000;
    timer = setInterval(timeTick, 250);

    updateTimerImg();
}

function reset() {
    stop();
    totalSeconds = pomodoroMinutes * 60;
    message.textContent = "";
    resetImg();
    showTime();
}

function timeTick() {
    const timeLeft = endTime - Date.now();
    const secondsLeft = Math.max(0, Math.ceil(timeLeft / 1000));

    if (secondsLeft !== totalSeconds) {
        totalSeconds = secondsLeft;
        showTime();
    }

    if (secondsLeft === 0) {
        stop();
        playAlertSound();
        message.textContent = "Time's up!";
        showFinishedImg();
        return;
    }

    updateTimerImg();
}

function setTimerType(minutes, newTimerType) {
    stop();
    timerType = newTimerType;
    pomodoroMinutes = minutes;
    totalSeconds = pomodoroMinutes * 60;
    message.textContent = "";
    resetImg();
    mainWindow.hidden = true;
    timerWindow.hidden = false;
    setMinimized(timerWindow, timerMinimizeButton, false);
    showTime();
}

function closeTimerWindow() {
    reset();
    mainWindow.hidden = false;
    setMinimized(mainWindow, minimizeButton, false);
    timerWindow.hidden = true;
}

function playAlertSound() {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.4);
}

function getTimePassed() {
    return 1 - totalSeconds / (pomodoroMinutes * 60);
}

function stopImgLoop() {
    clearTimeout(imgLoop);
    imgLoop = null;
}

function coffeeLoop() {
    loopFrame = (loopFrame + 1) % coffeeImgs.length;
    timerImg.src = coffeeImgs[loopFrame];
    imgLoop = setTimeout(coffeeLoop, 1000);
}

function moonLoop() {
    loopFrame = (loopFrame + 1) % moonImgs.length;
    timerImg.src = moonImgs[loopFrame];
    imgLoop = setTimeout(moonLoop, 800);
}

function kittyBreathLoop() {
    loopFrame = loopFrame === 2 ? 3 : 2;
    timerImg.src = `cat${loopFrame}.png`;
    imgLoop = setTimeout(kittyBreathLoop, 2 ? 1200 : 900);
}

function kittyBlinkLoop() {
    timerImg.src = "cat1.png";
    imgLoop = setTimeout(() => {
        timerImg.src = "cat2.png";
        imgLoop = setTimeout(kittyBlinkLoop, 150);
    }, 3000);
}

function updateTimerImg() {
    const timePassed = getTimePassed();

    if (timerType == "focus") {
        if (timePassed < 0.4) {
            if (!imgLoop) {
                coffeeLoop();
            }
        }
        else {
            stopImgLoop();
            if (timePassed < 0.6) {
                timerImg.src = "coffee3.png";
            }
            else if (timePassed < 0.8) {
                timerImg.src = "coffee4.png";
            }
            else {
                timerImg.src = "coffee5.png";
            }
        }
    }
    else if (timerType == "short") {
        if (!imgLoop) {
            kittyBreathLoop();
        }
    }
    else {
        if (!imgLoop) {
            moonLoop();
        }
    }
}

function resetImg() {
    stopImgLoop();
    loopFrame = 1;
    if (timerType == "focus") {
        timerImg.src = "coffee1.png";
    }
    else if (timerType == "short") {
        timerImg.src = "cat2.png";
    }
    else {
        timerImg.src = "moon5.png";
    }
}

function showFinishedImg() {
    stopImgLoop();
    if (timerType == "focus") {
        timerImg.src = "coffee5.png";
    }
    else if (timerType == "short") {
        kittyBlinkLoop();
    }
    else {
        timerImg.src = "moon1.png";
    }
}

function setMinimized(win, button, isMinimized) {
    win.classList.toggle("minimized", isMinimized);
    button.textContent = isMinimized ? "□" : "_";
}


startButton.addEventListener("click", start);
stopButton.addEventListener("click", stop);
resetButton.addEventListener("click", reset);
focusButton.addEventListener("click", () => setTimerType(25, "focus"));
breakButton.addEventListener("click", () => setTimerType(5, "short"));
longBreakButton.addEventListener("click", () => setTimerType(15, "long"));
timerCloseButton.addEventListener("click", closeTimerWindow);

closeButton.addEventListener("click", () => {
    reset();
    mainWindow.hidden = true;
    timerWindow.hidden = true;
})

desktopButton.addEventListener("click", () => {
    if (!timerWindow.hidden) {
        closeTimerWindow()
    }
    else {
        mainWindow.hidden = false;
        setMinimized(mainWindow, minimizeButton, false);
    }
})

minimizeButton.addEventListener("click", () => {
    setMinimized(mainWindow, minimizeButton, !mainWindow.classList.contains("minimized"));
})

timerMinimizeButton.addEventListener("click", () => {
    setMinimized(timerWindow, timerMinimizeButton, !timerWindow.classList.contains("minimized"));
})

showTime();