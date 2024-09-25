var state = 0;
var defTimer = 60;
var infTimer = false;
var noSleep = new NoSleep();
noSleep.enable();
const beep_low = new Audio("./media/Beep_low.m4a");
const beep_high = new Audio("./media/Beep_high.m4a");
beep_low.volume = 0.1;
beep_high.volume = 0.1;

// Page setup
overlayText = document.getElementById("overlayText");

var elem = document.documentElement;

/* View in fullscreen , still a work in progress*/
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
}

// preloader util
function fadein(duration = 1000) {
    let preloader = document.getElementById('preloader')
    preloader.style.display='block'; 
    setTimeout(function () {
    preloader.style.display='none';
        }, duration);
        // show canvas after that
    
        
    };

// Will pushups be recorded?
var recordReps=false;

var countdown;

function start() {
    document.querySelectorAll('*:not(button)').forEach((node) => node.style.backgroundColor='#636363');
    readyTime = 6;
    readyCountdown = setInterval(() => {
        readyTime--;
        if (readyTime == 0) {
            clearInterval(readyCountdown);
            beep_high.currentTime = 0;
            beep_high.play();
            recordReps=true;
            // change background color to green
            document.querySelectorAll('*:not(button)').forEach((node) => node.style.backgroundColor='#006d00');
            // start timer countdown
            var timeLeft = defTimer;
            if (infReps == true) {
                pushUps = 0;
            } else if (infReps == false && document.getElementById("repsInp").value > 0) {
                pushUps = document.getElementById("repsInp").value;
            } else {
                pushups = 60;
            }
            // display "START" overlay
            overlayText.innerText = 'START!';
            fadein();
            // reset pushup count
            document.getElementById("indicator_reps").innerText = `Reps: ${pushUps}`;
            countdown = setInterval(function () {
                if (infTimer == true) {
                    timeLeft ++;
                } else {
                    timeLeft --;
                }
                document.getElementById("timer").innerText= Math.abs(timeLeft);
                if (timeLeft == 0) {
                    updateStart();
                    end();
                    state = 0;
                }}, 1000);
        } else {
            beep_low.currentTime = 0;
            beep_low.play();
            overlayText.innerText = readyTime;
            fadein(900);
        }
    }, 1000);
}

function end(newText = "Time's up!") {
    beep_high.currentTime = 0;
    beep_high.play();

    // display "STOP" overlay
    overlayText.innerText=newText;
    fadein();
    // stop the timer
    clearInterval(countdown);
    clearInterval(readyCountdown);

    // stop accepting more pushups
    recordReps=false;

    // change background color to black
    document.querySelectorAll('*:not(button)').forEach((node) => node.style.backgroundColor='black');
}

function reset() {
    // stop accepting more pushups
    recordReps=false;
    // display "STOP" overlay
    overlayText.innerText="Resetting...";
    fadein();
    // stop timer in case
    clearInterval(countdown);
    document.getElementById("timer").innerText=defTimer; // just in case...
    document.getElementById("indicator_reps").innerText = `Reps: ${0}`;

    // change background color to black
    document.querySelectorAll('*:not(button)').forEach((node) => node.style.backgroundColor='black');
}

// CSS calculations for UI
document.getElementById("indicator_reps").style.visibility='hidden';
document.getElementById("indicator_warning").style.visibility='hidden';
document.getElementById("indicator_position").style.visibility='hidden';

document.getElementById("startStopBtn").addEventListener("click", startStopButton);





function startTrainer() {
    document.getElementById("splash").style.display = "none";
    document.getElementsByTagName('canvas')[0].style.display = 'block'; //throws error if start clicked too early, but it's ok 
}

function updateStop() {
    btn = document.getElementById("startStopBtn");
    btn.style.backgroundColor = "red";
    btn.innerHTML = `<img class="buttonIcon" src="../media/Stop_Icon.png">Stop</button>`
    document.getElementById("menuBtn").disabled = true;
    document.getElementById("settingsBtn").disabled = true;
    document.getElementById("logBtn").disabled = true;
}

function updateStart() {
    btn = document.getElementById("startStopBtn");
    btn.style.backgroundColor = "rgb(0, 109, 0)";
    btn.innerHTML = `<img class="buttonIcon" src="../media/Play_Icon.png">Start</button>`
    document.getElementById("menuBtn").disabled = false;
    document.getElementById("settingsBtn").disabled = false;
    document.getElementById("logBtn").disabled = false;
}


// Button controls
function startStopButton() {
    if (state == 0) {
        state = 1;
        updateStop();
        document.getElementById("stationTypeSelector").disabled=true
        start();
    } else if (state == 1) {
        state = 0;
        updateStart();
        // stop timer in case
        clearInterval(countdown);
        document.getElementById("timer").innerText=defTimer; // just in case...
        end()
        window.alert('Timer stopped early');
        document.getElementById("stationTypeSelector").disabled=false;
    }
}
