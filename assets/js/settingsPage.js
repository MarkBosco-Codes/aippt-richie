var settingsOverlay = document.getElementById("settingsOverlay");
settingsOverlay.style.display="none";
function toggleSettings(){
    if (settingsOverlay.style.display=="none"){ // show exercise log
        //update UI
        settingsOverlay.style.display='block';
        document.getElementById("startStopBtn").style.visibility='hidden';
        document.getElementById("logBtn").style.visibility='hidden';

        document.getElementById("menuBtn").style.visibility='hidden';

        document.getElementById("settingsBtn").innerHTML='<img class="buttonIcon" src=".\\assets\\media\\Cross_Icon.png">Close';
        document.getElementById("video_wrapper").style.visibility='hidden';
    } else {
        settingsOverlay.style.display='none';
        document.getElementById("startStopBtn").style.visibility='visible';
        document.getElementById("logBtn").style.visibility='visible';

        document.getElementById("menuBtn").style.visibility='visible';

        document.getElementById("settingsBtn").innerHTML='<img class="buttonIcon" src=".\\media\\Settings_Icon.png">Settings';
        document.getElementById("video_wrapper").style.visibility='visible';
    }
}

function submitSettings() {
    // Update station type
    stationType = document.getElementById("stationTypeSelector").value;
    document.getElementById("exercise_type").innerText = stationType;
    

    // Update timer
    let newTimer = document.getElementById("timeInp").value;
    newTimer = Math.abs(Number(newTimer));
    if (Number.isInteger(newTimer) && newTimer > 0 && newTimer < 999) {
        if (infTimer == true) {
            newTimer = 0;
        }
        defTimer = newTimer;
        document.getElementById("timer").innerText=defTimer;

    }

    // Update reps
    let repGoal = document.getElementById("repsInp").value;
    repGoal = Math.abs(Number(repGoal));
    if (Number.isInteger(repGoal) && repGoal > 0 && repGoal < 999) {
        if (infReps == true) {
            repGoal = 0;
        }
        pushUps = repGoal;
        document.getElementById("indicator_reps").innerText=`Reps: ${pushUps}`;

    }
    // Close settings
    document.getElementById("settingsError").textContent='';
    settingsOverlay.style.display='none';
    document.getElementById("startStopBtn").style.visibility='visible';
    document.getElementById("logBtn").style.visibility='visible';
    document.getElementById("menuBtn").style.visibility='visible';
    document.getElementById("settingsBtn").innerHTML='<img class="buttonIcon" src=".\\assets\\media\\Settings_Icon.png">Settings';
    document.getElementById("video_wrapper").style.visibility='visible';
}

// // Close settings
// settingsOverlay.style.display='none';
// document.getElementById("startStopBtn").style.visibility='visible';
// document.getElementById("logBtn").style.visibility='visible';
// document.getElementById("stationTypeSelector").style.visibility='visible';
// document.getElementById("settingsBtn").innerHTML='<img class="buttonIcon" src="\\media\\Settings_Icon.png">Settings';
// document.getElementById("video_wrapper").style.visibility='visible';



function stopTrainer() {
    document.getElementById("splash").style.display = "block";
    settingsOverlay.style.display='none';
    document.getElementById("startStopBtn").style.visibility='visible';
    document.getElementById("logBtn").style.visibility='visible';
    document.getElementById("stationTypeSelector").style.visibility='visible';
    document.getElementById("settingsBtn").innerHTML='<img class="buttonIcon" src=".\\assets\\media\\Settings_Icon.png">Settings';
    document.getElementById("video_wrapper").style.visibility='visible';
}

document.getElementById("timeCheck").addEventListener("change", function() {
    let input = document.getElementById('timeInp');
    if(this.checked) {
        input.disabled = false;
        input.focus();
        infTimer = false;
    } else {
        input.disabled=true;
        infTimer = true;
    }
});

document.getElementById("repCheck").addEventListener("change", function() {
    let input = document.getElementById('repsInp');
    if(this.checked) {
        input.disabled = false;
        input.focus();
        infReps = false;
    } else {
        input.disabled=true;
        infReps = true;
    }
});

var instrOverlay = document.getElementById("instructions");
function toggleMenu() {
    document.getElementById("instrBackBtn").style.visibility = 'hidden';
    if (instrOverlay.style.display=="none"){ // show exercise log
        //update UI
        instrOverlay.style.display='block';
        document.getElementById("settingsBtn").style.visibility='hidden';
        document.getElementById("startStopBtn").style.visibility='hidden';
        document.getElementById("logBtn").style.visibility='hidden';
        document.getElementById("menuBtn").innerHTML='<img class="buttonIcon" src=".\\assets\\media\\Cross_Icon.png">Close';
        // document.getElementById("video_wrapper").style.visibility='hidden';
    } else {
        instrOverlay.style.display='none';
        document.getElementById("settingsBtn").style.visibility='visible';
        document.getElementById("startStopBtn").style.visibility='visible';
        document.getElementById("logBtn").style.visibility='visible';
        document.getElementById("menuBtn").innerHTML='<img class="buttonIcon" src=".\\assets\\media\\Instructions_Icon.png">Info';
        // document.getElementById("video_wrapper").style.visibility='visible';
    }
}
