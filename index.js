const btn = document.getElementById('loginBtn');
let hoverCount = 0;
const maxAttempts = 5;

const hoverMessages = [
  "Nope.",
  "Too slow!",
  "Try harder!",
  "Getting warmer...",
  "Almost there!",
  "Okay, fine. Click me!"
];

btn.addEventListener('mouseover', () => {
  if (hoverCount < maxAttempts) {
    btn.innerText = hoverMessages[hoverCount];
    hoverCount++;

    const randX = Math.random() * (window.innerWidth - 120);
    const randY = Math.random() * (window.innerHeight - 60);
    btn.style.left = `${randX}px`;
    btn.style.top = `${randY}px`;
  } else {
    btn.innerText = hoverMessages[maxAttempts];
    btn.style.cursor = 'pointer';
  }
});

btn.addEventListener('click', () => {
  if (hoverCount >= maxAttempts) {
    //alert("Login successful! 🎉");
    // Redirect to your main project page
    window.location.href = "login.html"; // Change if needed
  } else {
    alert("You have to catch me first! 😝");
  }
});
