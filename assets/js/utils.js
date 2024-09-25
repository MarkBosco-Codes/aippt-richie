// PUSHUP THRESHOLDS
var pushup_up_threshold                     = 160;  // Arm angle - Higher harder
var straight_back_threshold_1               = 160;  // Back angle (Used for both male and female) - Higher harder
var straight_back_threshold_2               = 160;  // Back angle 2 (Used for male only) - Higher harder
var wrist_movement_threshold_percent        = 0.1;  // Wrist movement - For zeroing purposes - Lower more accurate
var distance_threshold_percent              = 0.9; // Forearm to Bicep ratio - Prevent wide arm bias - Higher move accurate NOT TOO HIGH
var pushup_down_distance_threshold_percent  = 0.25;  // Distance from elbow to shoulder to count down - Lower harder

// PUSHUP Down Threshold - Front View
var pushup_down_threshold                   = 0.25;  // Distance form elbow to shoulder to count down - Lower harder
var pushup_up_distance                      = 1.2;

// SITUP THRESHOLDS
var cupping_ears_threshold_percent          = 0.8;  // How near wrists have to be from ears - Lower harder
var foot_movement_threshold_percent         = 0.15;  // Foot movement - For zeroing purposes - Lower more accurate
var elbow_touching_threshold_percent        = 0.45; // How near elbow has to be from knees - Lower harder
var down_level_threshold_percent            = 0.6;  // How flat candidate has to be - Lower harder

const utils = {
  createElement: (type, attributes) => {
    let element = document.createElement(type);
    for (var key in attributes) {
      if (key == "class") {
        element.classList.add.apply(element.classList, attributes[key]);
      } else {
        element[key] = attributes[key];
      }
    }
    return element;
  },
  drawPoint: (ctx, y, x, r, name) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff0000";
    ctx.fill();
    ctx.font = "7px Arial";
    ctx.fillText(name, x + 7, y + 2);
  },
  getDistance: (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  },
  getPointToLine: (shoulderX, shoulderY, elbow1X, elbow1Y, elbow2X, elbow2Y) => {
    var A = shoulderX - elbow1X;
    var B = shoulderY - elbow1Y;
    var C = elbow2X - elbow1X;
    var D = elbow2Y - elbow1Y;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;

    // in case of 0 length line
    if (len_sq != 0) {
      param = dot / len_sq;
    }

    var xx, yy;

    if (param < 0) {
      xx = elbow1X;
      yy = elbow1Y;
    } else if (param > 1) {
      xx = elbow2X;
      yy = elbow2Y;
    } else {
      xx = elbow1X + param * C;
      yy = elbow1Y + param * D;
    }

    var dx = shoulderX - xx;
    var dy = shoulderY - yy;
    return Math.sqrt(dx * dx + dy * dy);
  },
  findAngle: (A,B,C) => {
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    var ang = Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
    ang *= 180 / Math.PI;
    if (ang > 180) {
        ang -= 180;
    };
    return ang;
  },
  processKeypoint: (keypoints, joint) => {
    try {
      let keypoint = keypoints.filter((k) => {return k.name === joint;});
      return { x : keypoint[0].x , y : keypoint[0].y};
    } catch {
      return null;
    };
  },
  findPointInList: (keypoints, keypointList) => {
    for (i in keypointList) {
      var foundPoint = utils.processKeypoint(keypoints, keypointList[i]);
      if (foundPoint != null) {
        return foundPoint;
      };
    };
  },
  pointlistInKeypoints: (keypoints, keypointList) => {
    let returnList = [];
    for (i in keypointList) {
      var foundPoint = utils.processKeypoint(keypoints, keypointList[i]);
      if (foundPoint != null) {
        returnList.push(foundPoint);
      };
    };
    return returnList;
  },
  largestElement(arr) {
    return arr.reduce((largest, current) =>
        (current > largest ? current : largest), arr[0]);
  },
  smallestElement(arr) {
    return arr.reduce((smallest, current) =>
        (current < smallest ? current : smallest), arr[0]);
  },
  drawSegment(ctx, pair1, pair2, color, scale) {
    ctx.beginPath();
    ctx.moveTo(pair1.x * scale, pair1.y * scale);
    ctx.lineTo(pair2.x * scale, pair2.y * scale);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  },
  drawLine(ctx, scale, point1, point2) {
    utils.drawSegment(
      ctx,
      { x: point1.x, y: point1.y },
      { x: point2.x, y: point2.y },
      "red",
      scale
    );
  },
  drawAng(ctx, scale, point1, point2, point3) {
    utils.drawLine(ctx, scale, point1, point2)
    utils.drawLine(ctx, scale, point2, point3)
  },
  getPushupPositionV2: (keypoints, ctx, scale) => {
    try {
      // Declare point variables
      let shoulderpoint = utils.findPointInList(keypoints, ["left_shoulder", "right_shoulder"]);
      let hippoint      = utils.findPointInList(keypoints, ["left_hip", "right_hip"]);
      let kneepoint     = utils.findPointInList(keypoints, ["left_knee", "right_knee"]);
      let anklepoint    = utils.findPointInList(keypoints, ["left_ankle", "right_ankle"]);
      let elbowpoint    = utils.findPointInList(keypoints, ["left_elbow", "right_elbow"]);
      let wristpoint    = utils.findPointInList(keypoints, ["left_wrist", "right_wrist"]);
      let wristpointslist   = utils.pointlistInKeypoints(keypoints, ["left_wrist", "right_wrist"]);
      let footpointslist    = utils.pointlistInKeypoints(keypoints, ["left_ankle", "right_ankle"]);

      utils.drawAng(ctx, scale, shoulderpoint, elbowpoint, wristpoint);
      utils.drawAng(ctx, scale, shoulderpoint, hippoint, kneepoint);
      utils.drawAng(ctx, scale, hippoint, kneepoint, footpointslist[0]);

      // Filter 1: All back angles < Back straight threshold
      let backAngle1 = utils.findAngle(shoulderpoint, hippoint, kneepoint);
      let backAngle2 = utils.findAngle(hippoint, kneepoint, anklepoint);
      if (backAngle1 >= straight_back_threshold_1 && backAngle2 >= straight_back_threshold_2) {

        // Filter 2: Wrist y coord not too far from foot level
        thigh_length = utils.getDistance(hippoint, kneepoint);
        wrist_movement_threshold = thigh_length * wrist_movement_threshold_percent;
        let wristDistanceList = [];
        for (i in wristpointslist) {
          for (p in footpointslist) {
            wristDistanceList.push(footpointslist[p].y - wristpointslist[i].y);
          }
        }
        let wristDistance = utils.largestElement(wristDistanceList);
        if (wristDistance <= wrist_movement_threshold) {

          let forearm_length = utils.getDistance(elbowpoint, wristpoint);

          // Up condition: Elbow below shoulder, Arm angle >= up threshold
          let armAngle = utils.findAngle(shoulderpoint, elbowpoint, wristpoint);
          if (shoulderpoint.y < elbowpoint.y && armAngle >= pushup_up_threshold) {

            // Filter 3: Bicep length not too small (wide arm pushups) - FOR UP ONLY
            let bicep_length = utils.getDistance(shoulderpoint, elbowpoint);
            if (bicep_length >= forearm_length * distance_threshold_percent) {
              return "UP";
            }
          }

          pushup_down_distance_threshold = forearm_length * pushup_down_distance_threshold_percent;
          // Down condition: Elbow near OR above shoulder
          if (Math.abs(elbowpoint.y - shoulderpoint.y) < pushup_down_distance_threshold || shoulderpoint.y > elbowpoint.y) {
            return "DOWN";
          }
          
        } else {
          return "Warning : RIS"
        }
      } else {
        return "Warning : BAC";
      }
    } catch {}
  },
  getPushupPositionNoBack: (keypoints, ctx, scale) => {
    try {
      // Declare point variables
      let shoulderpoint = utils.findPointInList(keypoints, ["left_shoulder", "right_shoulder"]);
      let hippoint      = utils.findPointInList(keypoints, ["left_hip", "right_hip"]);
      let kneepoint     = utils.findPointInList(keypoints, ["left_knee", "right_knee"]);
      let anklepoint    = utils.findPointInList(keypoints, ["left_ankle", "right_ankle"]);
      let elbowpoint    = utils.findPointInList(keypoints, ["left_elbow", "right_elbow"]);
      let wristpoint    = utils.findPointInList(keypoints, ["left_wrist", "right_wrist"]);
      let wristpointslist   = utils.pointlistInKeypoints(keypoints, ["left_wrist", "right_wrist"]);
      let footpointslist    = utils.pointlistInKeypoints(keypoints, ["left_ankle", "right_ankle"]);

      utils.drawAng(ctx, scale, shoulderpoint, elbowpoint, wristpoint);
      utils.drawAng(ctx, scale, shoulderpoint, hippoint, kneepoint);
      utils.drawAng(ctx, scale, hippoint, kneepoint, footpointslist[0]);

      // Filter 1: All back angles < Back straight threshold
      // Bypassed for this algorithm
      // let backAngle1 = utils.findAngle(shoulderpoint, hippoint, kneepoint);
      // let backAngle2 = utils.findAngle(hippoint, kneepoint, anklepoint);
      
      //if (backAngle1 >= straight_back_threshold_1 && backAngle2 >= straight_back_threshold_2) {
      if (true){

        // Filter 2: Wrist y coord not too far from foot level
        thigh_length = utils.getDistance(hippoint, kneepoint);
        wrist_movement_threshold = thigh_length * wrist_movement_threshold_percent;
        let wristDistanceList = [];
        for (i in wristpointslist) {
          for (p in footpointslist) {
            wristDistanceList.push(footpointslist[p].y - wristpointslist[i].y);
          }
        }
        let wristDistance = utils.largestElement(wristDistanceList);
        if (wristDistance <= wrist_movement_threshold) {

          let forearm_length = utils.getDistance(elbowpoint, wristpoint);

          // Up condition: Elbow below shoulder, Arm angle >= up threshold
          let armAngle = utils.findAngle(shoulderpoint, elbowpoint, wristpoint);
          if (shoulderpoint.y < elbowpoint.y && armAngle >= pushup_up_threshold) {

            // Filter 3: Bicep length not too small (wide arm pushups) - FOR UP ONLY
            let bicep_length = utils.getDistance(shoulderpoint, elbowpoint);
            if (bicep_length >= forearm_length * distance_threshold_percent) {
              return "UP";
            }
          }

          pushup_down_distance_threshold = forearm_length * pushup_down_distance_threshold_percent;
          // Down condition: Elbow near OR above shoulder
          if (Math.abs(elbowpoint.y - shoulderpoint.y) < pushup_down_distance_threshold || shoulderpoint.y > elbowpoint.y) {
            return "DOWN";
          }
          
        } else {
          return "Warning : RIS"
        }
      } else {
        return "Warning : BAC"; 
      }
    } catch {}
  },
  getPushupPositionF: (keypoints, ctx, scale) => {
    try {
      // Declare point variables
      let shoulderpoint = utils.findPointInList(keypoints, ["left_shoulder", "right_shoulder"]);
      let hippoint      = utils.findPointInList(keypoints, ["left_hip", "right_hip"]);
      let kneepoint     = utils.findPointInList(keypoints, ["left_knee", "right_knee"]);
      let elbowpoint    = utils.findPointInList(keypoints, ["left_elbow", "right_elbow"]);
      let wristpoint    = utils.findPointInList(keypoints, ["left_wrist", "right_wrist"]);
      let wristpointslist   = utils.pointlistInKeypoints(keypoints, ["left_wrist", "right_wrist"]);
      let kneepointslist    = utils.pointlistInKeypoints(keypoints, ["left_knee", "right_knee"]);

      utils.drawAng(ctx, scale, shoulderpoint, elbowpoint, wristpoint);
      utils.drawAng(ctx, scale, shoulderpoint, hippoint, kneepoint);

      // Filter 1: Back angle < Back straight threshold
      let backAngle = utils.findAngle(shoulderpoint, hippoint, kneepoint);
      if (backAngle >= straight_back_threshold_1) {

        // Filter 2: Wrist y coord not too far from knee level
        thigh_length = utils.getDistance(hippoint, kneepoint);
        wrist_movement_threshold = thigh_length * wrist_movement_threshold_percent;
        let wristDistanceList = [];
        for (i in wristpointslist) {
          for (p in kneepointslist) {
            wristDistanceList.push(kneepointslist[p].y - wristpointslist[i].y);
          }
        }
        let wristDistance = utils.largestElement(wristDistanceList);
        if (wristDistance <= wrist_movement_threshold) {

          let forearm_length = utils.getDistance(elbowpoint, wristpoint);

          // Up condition: Elbow below shoulder, Arm angle >= up threshold
          let armAngle = utils.findAngle(shoulderpoint, elbowpoint, wristpoint);
          if (shoulderpoint.y < elbowpoint.y && armAngle >= pushup_up_threshold) {

            // Filter 3: Bicep length not too small (wide arm pushups) - FOR UP ONLY
            let bicep_length = utils.getDistance(shoulderpoint, elbowpoint);
            if (bicep_length >= forearm_length * distance_threshold_percent) {
              return "UP";
            }
          }

          pushup_down_distance_threshold = forearm_length * pushup_down_distance_threshold_percent;
          // Down condition: Elbow near OR above shoulder
          if (Math.abs(elbowpoint.y - shoulderpoint.y) < pushup_down_distance_threshold || shoulderpoint.y > elbowpoint.y) {
            return "DOWN";
          }
          
        } else {
          return "Warning : RIS";
        }
      } else {
        return "Warning : BAC";
      }
    } catch {}
  },
  getPushupPosition: (keypoints, ctx, scale) => {
    let LshoulderCoords = utils.findPointInList(keypoints, ["left_shoulder"]);
    let RshoulderCoords = utils.findPointInList(keypoints, ["right_shoulder"]);
    let LelbowCoords    = utils.findPointInList(keypoints, ["left_elbow"]);
    let RelbowCoords    = utils.findPointInList(keypoints, ["right_elbow"]);
    let LwristCoords    = utils.findPointInList(keypoints, ["left_wrist"]);
    let RwristCoords    = utils.findPointInList(keypoints, ["right_wrist"]);

    if (LelbowCoords == undefined && RelbowCoords == undefined) {
      return "DOWN";
    }

    utils.drawAng(ctx, scale, LshoulderCoords, LelbowCoords, LwristCoords);
    utils.drawAng(ctx, scale, RshoulderCoords, RelbowCoords, RwristCoords);

    Langle = utils.findAngle(LshoulderCoords, LelbowCoords, LwristCoords);
    Rangle = utils.findAngle(RshoulderCoords, RelbowCoords, RwristCoords);

    shoulders_distance = utils.getDistance(LshoulderCoords, RshoulderCoords);
    pushup_down_threshold_distance = shoulders_distance * pushup_down_threshold;
    // Down condition: Elbow near OR above shoulder
    if ((Math.abs(LelbowCoords.y - LshoulderCoords.y) < pushup_down_threshold_distance && Math.abs(RelbowCoords.y - RshoulderCoords.y) < pushup_down_threshold_distance)
    || (LshoulderCoords.y > LelbowCoords.y && RshoulderCoords.y > RelbowCoords.y)) {
      return "DOWN";
    }
    // Up conditions: both shoulders above elbows, angle between points > threshold
    if (LshoulderCoords.y < LelbowCoords.y && RshoulderCoords.y < RelbowCoords.y && Langle > pushup_up_threshold && Rangle > pushup_up_threshold) {
      let L_arm_length = utils.getDistance(LshoulderCoords, LwristCoords);
      let R_arm_length = utils.getDistance(RshoulderCoords, RwristCoords);
      let min_arm_length = shoulders_distance * pushup_up_distance;
      if (L_arm_length >= min_arm_length && R_arm_length >= min_arm_length) {
        let L_bicep_length = utils.getDistance(LshoulderCoords, LelbowCoords);
        let R_bicep_length = utils.getDistance(RshoulderCoords, RelbowCoords);
        let L_forearm_length = utils.getDistance(LelbowCoords, LwristCoords);
        let R_forearm_length = utils.getDistance(RelbowCoords, RwristCoords);
        if ((L_bicep_length >= L_forearm_length * distance_threshold_percent) &&
        (R_bicep_length >= R_forearm_length * distance_threshold_percent)) {
          return "UP";
        }
      }
    };
  },
  getSitupPositionV2: (keypoints, ctx, scale) => {
    try {
      // Declare point variables
      let facepoint     = utils.findPointInList(keypoints, ["left_ear", "right_ear", "left_eye", "right_eye", "nose"]);
      let kneepoint     = utils.findPointInList(keypoints, ["left_knee", "right_knee"]);
      let hippoint      = utils.findPointInList(keypoints, ["left_hip", "right_hip"]);
      let shoulderpoint = utils.findPointInList(keypoints, ["left_shoulder", "right_shoulder"]);
      let wristpointslist   = utils.pointlistInKeypoints(keypoints, ["left_wrist", "right_wrist"]);
      let elbowpointslist   = utils.pointlistInKeypoints(keypoints, ["left_elbow", "right_elbow"]);
      let anklepointslist   = utils.pointlistInKeypoints(keypoints, ["left_ankle", "right_ankle"]);
      let hippointslist   = utils.pointlistInKeypoints(keypoints, ["left_hip", "right_hip"]);

      utils.drawAng(ctx, scale, shoulderpoint, elbowpointslist[0], wristpointslist[0]);
      utils.drawAng(ctx, scale, shoulderpoint, hippoint, kneepoint);

      // Filter 1: Cupping ear
      let thigh_length = utils.getDistance(kneepoint, hippoint);
      let cupping_ears_threshold = thigh_length * cupping_ears_threshold_percent;
      let cupping_distance_list = []
      for (i in wristpointslist) {
        cupping_distance_list.push(utils.getDistance(facepoint, wristpointslist[i]));
      }
      let cupping_distance = utils.largestElement(cupping_distance_list);
      if (cupping_ears_threshold == 0 || cupping_distance <= cupping_ears_threshold) {

        // Filter 2: Ankle y near hip y
        let foot_movement_threshold = thigh_length * foot_movement_threshold_percent;
        let foot_movement_list = [];
        for (i in anklepointslist) {
          for (p in hippointslist) {
            foot_movement_list.push(hippointslist[p].y - anklepointslist[i].y);
          }
        }
        let foot_movement = utils.largestElement(foot_movement_list);
        if (foot_movement <= foot_movement_threshold) {

          // Up Condition: Elbow touch knee
          let elbow_touching_threshold = thigh_length * elbow_touching_threshold_percent;
          let elbow_touching_distance_list = [];
          for (i in elbowpointslist) {
            elbow_touching_distance_list.push(utils.getDistance(kneepoint, elbowpointslist[i]));
          }
          let elbow_touching_distance = utils.largestElement(elbow_touching_distance_list);
          if (elbow_touching_distance <= elbow_touching_threshold) {
            return "UP";
          };

          // Down Condition: Shoulder y near hip y
          let down_level_threshold = thigh_length * down_level_threshold_percent;
          if (Math.abs(hippoint.y - shoulderpoint.y) <= down_level_threshold) {
            return "DOWN";
          };
        } else {
          return "Warning : HIP";
        }
      } else {
        return "Warning : EAR";
      };
    } catch {};
  }
};
