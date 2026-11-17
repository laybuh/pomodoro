const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");
const startButton = document.getElementById("start-btn");
const stopButton = document.getElementById("stop-btn");
const resetButton = document.getElementById("reset-btn");
const focusButton = document.getElementById("focus-btn");
const breakButton = document.getElementById("break-btn");
const longBreakButton = document.getElementById("long-break-btn");
const message = document.getElementById("message");

let pomodoroMinutes = 25;
let totalSeconds = pomodoroMinutes * 60;
let timer = null;
let endTime = null;
let audioContext = null;

function showTime() {
    minutesInput.textContent = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    secondsInput.textContent = String(totalSeconds % 60).padStart(2, "0");
}

function stop() {
    clearInterval(timer);
    timer = null;
}


function start() {
    if (timer) return;
    if (totalSeconds <= 0) return;

    if (!audioContext) audioContext = new AudioContext();
    audioContext.resume();

    message.textContent = "";
    endTime = Date.now() + totalSeconds * 1000;
    timer = setInterval(timeTick, 250);
}

function reset() {
    stop();
    totalSeconds = pomodoroMinutes * 60;
    message.textContent = "";
    showTime();
}

function timeTick(){
    const timeLeft = endTime - Date.now();
    const secondsLeft = Math.max(0, Math.ceil(timeLeft / 1000));

    if (secondsLeft === 0) {
        stop();
        playAlertSound();
        message.textContent = "Time's up!";
    }

    if (secondsLeft !== totalSeconds) {
        totalSeconds = secondsLeft;
        showTime();
    }
}

function setTimerType(minutes) {
    stop();
    pomodoroMinutes = minutes;
    totalSeconds = pomodoroMinutes * 60;
    message.textContent = "";
    showTime();
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

startButton.addEventListener("click", start);
stopButton.addEventListener("click", stop);
resetButton.addEventListener("click", reset);
focusButton.addEventListener("click", () => setTimerType(25));
breakButton.addEventListener("click", () => setTimerType(5));
longBreakButton.addEventListener("click", () => setTimerType(15));

showTime();