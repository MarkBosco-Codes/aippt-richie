if (localStorage.getItem("aiPPT_log")==null){
    var exerciseLog = {}
}
else{
    var exerciseLog=JSON.parse(localStorage.getItem("aiPPT_log"));
}

var exerciseLogOverlay = document.getElementById("exerciseLogOverlay");
exerciseLogOverlay.style.display="none";
function ToggleExerciseLog(){
    if (exerciseLogOverlay.style.display=="none"){ // show exercise log
    logTableBody = document.getElementById("logTableBody");
    logTableBody.innerHTML='';
    //construct table
    for (const [date, exercises] of Object.entries(exerciseLog)) { //iterate through dates
        //console.log(date, exercises);
        var repString = '';
        for (const [exerciseType, reps] of Object.entries(exercises)) { //iterate through exercise types
            repString+=`${reps} ${exerciseType}<br>`
        }
        logTableBody.innerHTML+=`<tr>
        <td class="table-date">&nbsp;${date}</td>
        <td>${repString.slice(0,-4)}</td>
      </tr>`
      }

    //update UI
    exerciseLogOverlay.style.display='block';
    document.getElementById("startStopBtn").style.visibility='hidden';
    document.getElementById("settingsBtn").style.visibility='hidden';

    document.getElementById("menuBtn").style.visibility='hidden';

    document.getElementById("logBtn").innerHTML='<img class="buttonIcon" src="\\media\\Cross_Icon.png">Close';
    document.getElementById("video_wrapper").style.visibility='hidden';
    
    }
    else {
        exerciseLogOverlay.style.display='none';
        document.getElementById("startStopBtn").style.visibility='visible';
        document.getElementById("settingsBtn").style.visibility='visible';

        document.getElementById("menuBtn").style.visibility='visible';

        document.getElementById("logBtn").innerHTML='<img class="buttonIcon" src="\\media\\Log_Icon.png">Log';
        document.getElementById("video_wrapper").style.visibility='visible';
    }
}

function updateExerciseLog(exerciseType,reps){
    var currentDate = new Date().toLocaleDateString();
    if (exerciseLog[currentDate] == undefined){exerciseLog[currentDate]={}}
    if (exerciseLog[currentDate][exerciseType] == undefined){exerciseLog[currentDate][exerciseType]=0}
    exerciseLog[currentDate][exerciseType]=exerciseLog[currentDate][exerciseType]+1;
    localStorage.setItem("aiPPT_log",JSON.stringify(exerciseLog))

}