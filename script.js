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
const vapidPublicKey = "PASTE_YOUR_VAPID_PUBLIC_KEY_HERE";

let pomodoroMinutes = 25;
let totalSeconds = pomodoroMinutes * 60;
let timer = null;
let endTime = null;
let audioContext = null;
let timerType = "focus";
let imgLoop = null;
let loopFrame = 0;
let wakeLock = null;
let pushMessageId = null;

function showTime() {
    minutesInput.textContent = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    secondsInput.textContent = String(totalSeconds % 60).padStart(2, "0");
}

function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    stopImgLoop();
    releaseWakeLock();
    cancelPush();
}


function start() {
    if (timer) return;
    if (totalSeconds <= 0) return;

    if (!audioContext) audioContext = new AudioContext();
    audioContext.resume();

    message.textContent = "";
    endTime = Date.now() + totalSeconds * 1000;
    timer = setInterval(timeTick, 250);
    requestWakeLock();
    schedulePush();

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
        pushMessageId = null;
        stop();
        playAlertSound();
        if ("Notification" in window && Notification.permission === "granted") {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification("time's up!", { body: "take a break", icon: "images/icon3.png", vibrate: [200, 100, 200], tag: "pomodoro", requireInteraction: true });
            });
        }
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
    audioContext.resume().then(() => {
        const notes = [784, 988, 1175, 1568];
        for (let repeat = 0; repeat < 3; repeat++) {
            notes.forEach((freq, i) => {
                const time = audioContext.currentTime + repeat * 1 + i * 0.15;
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                oscillator.type = "triangle";
                oscillator.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(0.0001, time);
                gain.gain.exponentialRampToValueAtTime(0.3, time + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
                oscillator.connect(gain);
                gain.connect(audioContext.destination);
                oscillator.start(time);
                oscillator.stop(time + 0.45);
            });
        }
    });
}

function requestWakeLock() {
    if (!("wakeLock" in navigator)) return;
    navigator.wakeLock.request("screen").then((lock) => {
        wakeLock = lock;
    }).catch(() => { });
}

function releaseWakeLock() {
    if (!wakeLock) return;
    wakeLock.release();
    wakeLock = null;
}



function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

async function schedulePush() {
    if (!("Notification" in window)) return;
    const scheduledEnd = endTime;

    try {
        const permission = await Notification.requestPermission();
        if (permission != "granted" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) });
        }

        const response = await fetch("/api/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription, endTime: scheduledEnd, title: "time's up!", body: "take a break" })
        });
        const data = await response.json();

        if (timer && endTime == scheduledEnd) {
            pushMessageId = data.messageId;
        }
        else {
            sendCancel(data.messageId);
        }
    }
    catch (error) { }
}

function cancelPush() {
    if (!pushMessageId) return;
    sendCancel(pushMessageId);
    pushMessageId = null;
}

function sendCancel(messageId) {
    if (!messageId) return;
    fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId })
    }).catch(() => { });
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
    imgLoop = setTimeout(kittyBreathLoop, 1200);
}

function kittyBlinkLoop() {
    timerImg.src = "cat1.png";
    imgLoop = setTimeout(() => {
        timerImg.src = "cat2.png";
        imgLoop = setTimeout(kittyBlinkLoop, 150);
    }, 3000);
}

function updateTimerImg() {


    if (timerType == "focus") {

        if (!imgLoop) {
            coffeeLoop();
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

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && timer) {
        requestWakeLock();
    }
})

showTime();