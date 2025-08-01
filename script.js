const video = document.getElementById("video");

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


async function startDetecting() {
  setInterval(async () => {
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
    if (detections && detections.expressions) {
      const emotion = getTopExpression(detections.expressions);
      showSarcasticQuote(emotion);
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
    "Smiling? What are you up to?"
  ],
  sad: [
    "Cry me a river... but like, hurry up.",
    "Wow, bringing the mood down again, huh?"
  ],
  angry: [
    "Easy there, Hulk. It’s just a website.",
    "If looks could kill, I’d be... mildly inconvenienced."
  ],
  surprised: [
    "You look like you just saw the bill after shopping online.",
    "Wow, life still surprises you?"
  ],
  neutral: [
    "Poker face much?",
    "Are you alive or buffering?"
  ]
};


function showSarcasticQuote(emotion) {
    console.log("Detected emotion:", emotion);
  const quotes = sarcasticQuotes[emotion] || sarcasticQuotes["neutral"];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quote").innerText = `"${quote}"`;
}

