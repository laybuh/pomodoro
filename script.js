const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");
const startButton = document.getElementById("start-btn");
const stopButton = document.getElementById("stop-btn");
const resetButton = document.getElementById("reset-btn");
const focusButton = document.getElementById("focus-btn");
const breakButton = document.getElementById("break-btn");
const longBreakButton = document.getElementById("long-break-btn");

let pomodoroMinutes = 25;
let totalSeconds = pomodoroMinutes * 60;
let timer = null;

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

    timer = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            showTime();
        }
        else {
            stop();
        }
    }, 1000);
}

function reset() {
    stop();
    totalSeconds = pomodoroMinutes * 60;
    showTime();
}

function setTimerType(minutes) {
    pomodoroMinutes = minutes;
    totalSeconds = pomodoroMinutes * 60;
    showTime();
}

startButton.addEventListener("click", start);
stopButton.addEventListener("click", stop);
resetButton.addEventListener("click", reset);
focusButton.addEventListener("click", () => setTimerType(25));
breakButton.addEventListener("click", () => setTimerType(5));
longBreakButton.addEventListener("click", () => setTimerType(15));

showTime();