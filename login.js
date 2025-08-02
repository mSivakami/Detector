const video = document.getElementById("video");
const emojiMap = {
  happy: "😄",
  sad: "😢",
  angry: "😠",
  surprised: "😲",
  disgusted: "🤢",
  fearful: "😱",
  neutral: "😐"
};

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Webcam access denied", err);
  });

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startDetecting)
  .catch(error => {
    console.error("Model loading failed:", error);
  });

/*const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js/models';

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
]).then(startDetecting)
  .catch(error => {
    console.error("Model loading failed:", error);
  });
*/


/*async function startDetecting() {
  setInterval(async () => {
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
    if (detections && detections.expressions) {
      const emotion = getTopExpression(detections.expressions);
      showSarcasticQuote(emotion);
    }
  }, 3000); // every 3 seconds
}*/

async function startDetecting() {
  setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections && detections.expressions) {
      const emotion = getTopExpression(detections.expressions);
      const emoji = emojiMap[emotion] || "🤔";
      const quote = showSarcasticQuote(emotion);

      // Update the DOM
      document.getElementById("emoji-box").innerText = emoji;
      document.getElementById("quote-box").innerText = quote;
    }
  }, 3000); // every 3 seconds
}



function getTopExpression(expressions) {
  const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
  console.log("Expressions:", sorted); 
  return sorted[0][0]; // Return the emotion with the highest score
}

const sarcasticQuotes = {
  happy: [
    "Oh, someone got 8 hours of sleep. Show off.",
    "Koodthal chiricha..Kodthal karayandi verum!",
    "Smiling? What are you up to?",
    "Ayyeee oola chiri",
    "Santhosham kond enik irikkan vayyeee"
  ],
  sad: [
    "Tears won't fix your code... or your love life.",
    "Allelum mondha kollula ini karnjat kolam aakano",
    "Wow, bringing the mood down again, huh?",
    "Ever tried. Ever failed. No matter. Try again. Fail again. Fail better."
  ],
  angry: [
    "Easy there, Hulk. It’s just a website.",
    "Dheshyam onnunum oru pariharam allaa!",
    "Who made u mad...I would like to thank them"
  ],
  surprised: [
    "You look like you just saw the bill after shopping online.",
    "Wow, life still surprises you?",
    "That face says 'I left the stove on.'",
    "Kutti mammaa Njn njetti mammaa"
  ],
  neutral: [
    "Is that your thinking face or are you just stuck?",
    "Poker face much?",
    "Are you alive or buffering?"
  ]
};


function showSarcasticQuote(emotion) {
    console.log("Detected emotion:", emotion);
  const quotes = sarcasticQuotes[emotion] || sarcasticQuotes["neutral"];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  //document.getElementById("quote-box").innerText = `"${quote}"`;
  return `"${quote}"`;
}

let mediaRecorder;
let recordedChunks = [];

document.getElementById("start-btn").addEventListener("click", () => {
  if (!video.srcObject) {
    console.warn("No video stream available to record.");
    return;
  }

  recordedChunks = [];

  mediaRecorder = new MediaRecorder(video.srcObject, {
    mimeType: "video/webm"
  });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, {
      type: "video/webm"
    });
    const url = URL.createObjectURL(blob);

    // Optional: auto-download recorded video
    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded_video.webm";
    a.click();
  };

  mediaRecorder.start();
  console.log("Recording started");
});

document.getElementById("stop-btn").addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("Recording stopped");
  }
});
const canvas = document.querySelector('.gestureCanvas');
const ctx = canvas.getContext('2d');

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(onHandResults);

function isThumbsUp(landmarks) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  // Check thumb is up and others are folded
  return (
    thumbTip.y < indexTip.y &&
    middleTip.y > thumbTip.y &&
    ringTip.y > thumbTip.y &&
    pinkyTip.y > thumbTip.y
  );
}

let lastGesture = null;

function onHandResults(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#0f0' });
    drawLandmarks(ctx, landmarks, { color: '#f0f', radius: 5 });

    if (isThumbsUp(landmarks) && lastGesture !== "thumbs_up") {
      lastGesture = "thumbs_up";
      console.log("👍 Detected thumbs up");

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      document.getElementById("quote").innerText = `"Wow, someone’s feeling *very* positive today."`;
    } else if (!isThumbsUp(landmarks)) {
      lastGesture = null;
    }
  }
}

const cam = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});
cam.start();

