// Initialize AOS animations
AOS.init({ duration: 1000 });

// DOM elements
const decodeBtn = document.getElementById("decodeBtn");
const fileInput = document.getElementById("fileInput");
const sampleImage = document.getElementById("sampleImage");
const generateBtn = document.getElementById("generateBtn");
const designResult = document.getElementById("designResult");
const customBtn = document.getElementById("customBtn");
const questionContainer = document.getElementById("questionContainer");

const randomImages = [
  "https://tse4.mm.bing.net/th/id/OIP.k-vgblw1Yey6qLY9PRR-ZgHaF7",
  "https://tse3.mm.bing.net/th/id/OIP._guf6PCDE6KTvsJWddHd7QHaE8",
  "https://cdn.apartmenttherapy.info/image/upload/v1654542441/at/designablehome.jpg"
];

const fallbackImage = "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg";
let lastUsedImage = null;

// Generate random image URL, avoiding the last used image
function getRandomImageUrl() {
  const availableImages = randomImages.filter(url => url !== lastUsedImage);
  const imagePool = availableImages.length > 0 ? availableImages : randomImages;
  const selectedUrl = imagePool[Math.floor(Math.random() * imagePool.length)];
  lastUsedImage = selectedUrl;
  return selectedUrl + "?t=" + new Date().getTime();
}

// Pricing data
const prices = {
  plants: { costs: { lots: 50, few: 30, none: 0, default: 35 } },
  lights: { costs: { string: 20, solar: 30, led: 25, natural: 0, default: 25 } },
  furniture: { costs: { sofa: 100, dining: 80, bench: 120, default: 90 } },
  stylePref: { costs: { modern: 30, rustic: 25, bohemian: 35, classic: 30, default: 25 } }
};

const exchangeRate = 83.5;
const defaultSelections = { plants: "lots", lights: "solar", furniture: "sofa", stylePref: "modern" };

// Decode button triggers file input
decodeBtn.addEventListener("click", () => fileInput.click());

// Handle file upload
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const imageUrl = URL.createObjectURL(file);
    sampleImage.src = imageUrl;
    generateBtn.classList.remove("d-none"); // Use Bootstrap's display utility
    sampleImage.onload = () => URL.revokeObjectURL(imageUrl);
  }
});

// Generate default design costs
generateBtn.addEventListener("click", () => {
  designResult.innerHTML = "<h3>Estimated Costs:</h3>";
  const ul = document.createElement("ul");
  ul.className = "list-unstyled"; // Bootstrap class for unstyled list
  let totalCost = 0;
  for (const category in defaultSelections) {
    const cost = prices[category].costs[defaultSelections[category]] || prices[category].costs.default;
    totalCost += cost;
    const li = document.createElement("li");
    li.textContent = `${category}: $${cost} / ₹${(cost * exchangeRate).toFixed(2)}`;
    ul.appendChild(li);
  }
  designResult.appendChild(ul);
  const total = document.createElement("p");
  total.className = "total-cost mt-3"; // Bootstrap margin utility
  total.textContent = `Total: $${totalCost} / ₹${(totalCost * exchangeRate).toFixed(2)}`;
  designResult.appendChild(total);
  // Trigger AOS refresh for dynamic content
  AOS.refresh();
});

/* Custom Q&A */
const questions = [
  { question: "Which style do you prefer?", key: "stylePref", options: ["modern", "rustic", "classic"] },
  { question: "What type of furniture do you want?", key: "furniture", options: ["sofa", "dining", "bench"] },
  { question: "How much greenery do you want?", key: "plants", options: ["lots", "few", "none"] }
];

let currentQ = 0;
let answers = {};

customBtn.addEventListener("click", () => {
  currentQ = 0;
  answers = {};
  showQuestion();
});

function showQuestion() {
  if (currentQ >= questions.length) {
    showResults();
    return;
  }
  const q = questions[currentQ];
  questionContainer.classList.add("active");
  questionContainer.innerHTML = `
    <p class="mb-2">${q.question}</p>
    <select class="form-select mb-3" aria-label="Select ${q.key}">
      <option value="">Select...</option>
      ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join("")}
    </select>
  `;
  const nextBtn = document.createElement("button");
  nextBtn.className = "next-btn btn btn-primary"; // Bootstrap button classes
  nextBtn.textContent = currentQ === questions.length - 1 ? "Finish" : "Next";
  nextBtn.onclick = () => {
    const select = questionContainer.querySelector("select");
    if (!select.value) {
      alert("Please select an option");
      return;
    }
    answers[q.key] = select.value;
    currentQ++;
    showQuestion();
  };
  questionContainer.appendChild(nextBtn);
  // Trigger AOS refresh for dynamic content
  AOS.refresh();
}

function showResults() {
  questionContainer.classList.remove("active");
  designResult.innerHTML = "<h3>Your Custom Design Choices:</h3>";
  const ul = document.createElement("ul");
  ul.className = "list-unstyled"; // Bootstrap class for unstyled list
  let total = 0;
  for (const key in answers) {
    const cost = prices[key].costs[answers[key]] || prices[key].costs.default;
    total += cost;
    const li = document.createElement("li");
    li.textContent = `${key}: ${answers[key]} ($${cost} / ₹${(cost * exchangeRate).toFixed(2)})`;
    ul.appendChild(li);
  }
  designResult.appendChild(ul);
  const totalCost = document.createElement("p");
  totalCost.className = "total-cost mt-3"; // Bootstrap margin utility
  totalCost.textContent = `Total: $${total} / ₹${(total * exchangeRate).toFixed(2)}`;
  designResult.appendChild(totalCost);
  sampleImage.src = getRandomImageUrl();
  // Trigger AOS refresh for dynamic content
  AOS.refresh();
}