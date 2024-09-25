// Main pose tracking logic - to be used with utils
let isLoaded = false;
let currentPosition = "UP";
var pushUps = 0;
var outlineDistance = 50;
var warningState = 0;
var minWarningLevel = 10;
var currentWarning = "";
var infReps = true;
var croppingAlgo = true;

function clearPreloader(x) {
  x.classList.add('preloader')
  setTimeout(function () { x.remove() }, 1100)
}

function countRep() {
  if (infReps == true) {
    pushUps++;
  } else {
    pushUps--;
  }
  speak(pushUps);
  document.getElementById("indicator_reps").innerText = `Reps: ${pushUps}`;
  updateExerciseLog(stationType, pushUps)
  if (infReps == false && pushUps == 0) {
    updateStart();
    end(newText = "Target Reached!");
    state = 0;
  }
}

const counter = {
  modMinWarning: (newLevel) => {
    minWarningLevel = newLevel;
  }
}

const canvas = utils.createElement("canvas", {
  id: "canvas",
});

const ctx = canvas.getContext("2d");
const video = document.getElementById("videoElement");
const snd = new Audio("./media/a-tone.wav");

var stationType = document.getElementById("stationTypeSelector").value;
document.getElementById("exercise_type").innerText = stationType;

function blurImg(ctx, blurRect) {
  ctx.drawImage(canvas, blurRect.x, blurRect.y, blurRect.width, blurRect.height,
    blurRect.x, blurRect.y, blurRect.width, blurRect.height
  );
  ctx.fillRect(blurRect.x, blurRect.y, blurRect.width, blurRect.height);
}

function focus(ctx, p1, p4) {
  blurImg(ctx, { x: 0, y: 0, height: p1.y, width: p4.x })
  blurImg(ctx, { x: p4.x, y: 0, height: p4.y, width: canvas.width - p4.x })
  blurImg(ctx, { x: p1.x, y: p4.y, height: canvas.height - p4.y, width: canvas.width - p1.x })
  blurImg(ctx, { x: 0, y: p1.y, height: canvas.height - p1.y, width: p1.x })
}

try {
  const getPose = async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (croppingAlgo) {ctx.fillStyle = 'rgba(128, 128, 128, 1)'};
    const poses = await Detector.estimatePoses(canvas);

    if (!isLoaded) {
      // css calculations for settings and exerciseLog overlays
      const heightOfFeed = document.getElementsByTagName('canvas')[0].getBoundingClientRect().bottom;
      document.getElementById('exerciseLogOverlay').style.maxHeight = heightOfFeed + 'px';
      document.getElementById('settingsOverlay').style.maxHeight = heightOfFeed + 'px';
      document.getElementById('instructions').style.maxHeight = heightOfFeed + 'px';
      clearPreloader(document.getElementById("loadingPreloader"));
      if (document.getElementById('splash').style.display != 'none') {
        document.getElementsByTagName('canvas')[0].style.display = 'none';

      }




      isLoaded = true;
      // show reps
      var canvasElement = document.getElementById("canvas");
      var parent = canvasElement.parentNode;
      var wrapper = document.createElement("div");
      wrapper.setAttribute("id", "video_wrapper");
      parent.replaceChild(wrapper, canvasElement);
      wrapper.appendChild(canvasElement);

      const reps_element = document.getElementById("indicator_reps");
      reps_element.style.visibility = 'visible';
      wrapper.appendChild(reps_element);

      const timer_element = document.getElementById("indicator_timer");
      timer_element.style.visibility = 'visible';
      wrapper.appendChild(timer_element);

      const warning_element = document.getElementById("indicator_warning");
      warning_element.style.visibility = 'visible';
      wrapper.appendChild(warning_element);

      const position_element = document.getElementById("indicator_position");
      position_element.style.visibility = 'visible';
      wrapper.appendChild(position_element);
    };
    const drawPoint = (y, x, r, name) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = "#ff0000";
      ctx.fill();
      ctx.font = "7px Arial";
      ctx.fillText(name, x + 7, y + 2);
    };
    const drawSegment = (pair1, pair2, color, scale) => {
      ctx.beginPath();
      ctx.moveTo(pair1.x * scale, pair1.y * scale);
      ctx.lineTo(pair2.x * scale, pair2.y * scale);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    };
    const drawLine = (point1, point2) => {
      drawSegment(
        { x: point1.x, y: point1.y },
        { x: point2.x, y: point2.y },
        "red",
        canvas.width / video.videoWidth
      );
    };
    const drawAng = (point1, point2, point3) => {
      drawLine(point1, point2)
      drawLine(point2, point3)
    };
    const drawKeypoints = (keypoints) => {
      for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];
        const { y, x } = keypoint;
        drawPoint(y, x, 5, keypoint.name);
      };
    };
    const torso_visible = (keypoints) => {
      MIN_CROP_KEYPOINT_SCORE = 0.3;
      let kp1 = keypoints.filter((k) => {return k.name === 'left_shoulder';});
      let kp2 = keypoints.filter((k) => {return k.name === 'right_shoulder';});
      let kp3 = keypoints.filter((k) => {return k.name === 'left_elbow';});
      let kp4 = keypoints.filter((k) => {return k.name === 'right_elbow';});
      let kp5 = keypoints.filter((k) => {return k.name === 'left_wrist';});
      let kp6 = keypoints.filter((k) => {return k.name === 'right_wrist';});

      return ((kp1[0].score > MIN_CROP_KEYPOINT_SCORE || kp2[0].score > MIN_CROP_KEYPOINT_SCORE) &&
      (kp3[0].score > MIN_CROP_KEYPOINT_SCORE || kp4[0].score > MIN_CROP_KEYPOINT_SCORE) &&
      (kp5[0].score > MIN_CROP_KEYPOINT_SCORE || kp6[0].score > MIN_CROP_KEYPOINT_SCORE))
    }
    const drawFocus = (keypoints) => {
      try {
        if (torso_visible(keypoints)) {
          xArr = [];
          yArr = [];
          for (i in keypoints) {
            xArr.push(keypoints[i].x);
            yArr.push(keypoints[i].y);
          }
          let p1 = {
            x: utils.smallestElement(xArr) - outlineDistance,
            y: utils.smallestElement(yArr) - outlineDistance
          };
          let p4 = {
            x: utils.largestElement(xArr) + outlineDistance,
            y: utils.largestElement(yArr) + outlineDistance
          };
          focus(ctx, p1, p4)
          drawAng(p1, {x: p4.x, y: p1.y}, p4)
          drawAng(p1, {x: p1.x, y: p4.y}, p4)
        }
      } catch {}
    }
    if (poses.length) {
      const { keypoints } = poses[0];
      let i = 0;
      while (i != keypoints.length) {
        if (keypoints[i]['score'] < 0.3) {
          keypoints.splice(i, 1);
          i--;
        }
        i++;
      };
      if (croppingAlgo) {drawFocus(keypoints)};
      drawKeypoints(keypoints);
      try {
        let canvScale = canvas.width / video.videoWidth;
        if (stationType == "Pushups (Side View)") {
          newPosition = utils.getPushupPositionV2(keypoints, ctx, canvScale);
        } else if (stationType == "Situps (Side View)") {
          newPosition = utils.getSitupPositionV2(keypoints, ctx, canvScale);
        } else if (stationType == "Pushups (Front View)") {
          newPosition = utils.getPushupPosition(keypoints, ctx, canvScale);
        } else if (stationType == "Knee Pushups (Side View)") {
          newPosition = utils.getPushupPositionF(keypoints, ctx, canvScale);
        }
        else if (stationType == "Pushups (no Back checking)") {
          newPosition = utils.getPushupPositionNoBack(keypoints, ctx, canvScale);
        }
        let position_element = document.getElementById("indicator_position");
        // Addition of reps
        if (currentPosition === "DOWN" && newPosition === "UP") {
          currentPosition = "UP";
          position_element.innerText = "▲";
          position_element.style.color = "#ffffff";
          // add one rep to the count
          if (recordReps == true) { // note: recordReps is set and controlled by station.js
            if (warningState > minWarningLevel) {
              speak("NO COUNT");
              warningState = 0;
            } else {
              countRep();
            }
          };
        };
        if (currentPosition === "UP" && newPosition === "DOWN") {
          currentPosition = "DOWN";
          position_element.innerText = "▼";
          position_element.style.color = "#000000";
          snd.currentTime = 0;
          snd.play();
          if (recordReps == true) {
            warningState = 1;
          }
        };
        let warning_element = document.getElementById("indicator_warning");
        let warning_code = document.getElementById("warning_code");
        if (recordReps == false) {
          warning_code.innerText = 'Press "Start" to begin counting reps';
        }
        else if (newPosition != undefined && newPosition.includes("Warning")) {
          if (recordReps == true && warningState > 0 && stationType != "Situps (Side View)") {
            warningState += 1;
          }
          warning_element.innerText = "⚠";
          warningCode = newPosition.slice(-3);
          var warningStr;
          switch (warningCode) {
            case "BAC":
              warningStr = "Straighten your back!";
              break;
            case "RIS":
              warningStr = "Keep your wrists grounded!";
              break;
            case "EAR":
              warningStr = "Cup your ears!";
              break;
            case "HIP":
              warningStr = "Keep your hip grounded!";
              break;
            default:
              warningStr = "";
              break;
          }
          // if (warningStr != "" && warningStr != currentWarning) {
          //   speakWarning(warningStr);
          // }
          warning_code.innerText = warningStr;
          currentWarning = warningStr;
        } else {
          warning_element.innerText = "";
          warning_code.innerText = "";
          currentWarning = "";
        }
      } catch { };
    };
  };

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      window.stream = stream;
      video.srcObject = stream;
      video.addEventListener("loadeddata", (event) => {
        document.querySelector(".container").appendChild(canvas);
        document.getElementsByTagName("canvas")[0].style.display = "block";
        const detectorConfig = {
          modelUrl: "/aippt-richie/MoveNet/pose_model.json"
        };
        poseDetection
          .createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig)
          .then((detector) => {
            window.Detector = detector;
            setInterval(getPose, 10);
          });
      });
    })
    .catch((error) => {

      var r = alert("Please enable your camera to use this app.");

    });
} catch { };

function speak(text) {
  speechSynthesis.cancel();
  // Create a SpeechSynthesisUtterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Select a language
  utterance.lang = "en-US";

  // Select a voice
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices[1]; // Choose a specific voice

  // Speak the text
  speechSynthesis.speak(utterance);
}


function speakWarning(text) {
  const utterance2 = new SpeechSynthesisUtterance(text);
  utterance2.lang = "en-US";
  speechSynthesis.speak(utterance2);
}

document.getElementById("croppingAlgo").addEventListener("change", function() {
  if (this.checked) {
    croppingAlgo = true;
  } else {
    croppingAlgo = false;
  }
})
