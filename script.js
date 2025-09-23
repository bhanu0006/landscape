// Initialize AOS animations
AOS.init({ duration: 1000 });
console.log("works")
// DOM elements
const decodeBtn = document.getElementById("decodeBtn");
const fileInput = document.getElementById("fileInput");
const sampleImage = document.getElementById("sampleImage");
const generateBtn = document.getElementById("generateBtn");
const designResult = document.getElementById("designResult");
const customBtn = document.getElementById("customBtn");
const questionContainer = document.getElementById("questionContainer");

// Predefined static images mapped to style preferences (12 images, 4 per style)
const styleImages = {
  modern: [
    "images/landscape1.jpeg", // Modern outdoor patio
    "images/landscape2.jpeg", // Modern balcony
    "images/landscape3.jpeg", // Modern garden
    "images/landscape4.jpeg" // Modern furniture setup
  ],
  rustic: [
    "images/landscape5.jpeg", // Rustic garden
    "images/landscape6.jpeg", // Rustic patio
    "images/landscape7.jpeg", // Rustic outdoor seating
    "images/landscape8.jpeg" // Rustic backyard
  ],
  classic: [
    "images/landscape9.jpeg", // Classic garden
    "images/landscape10.jpeg", // Classic outdoor space
    "images/landscape11.jpeg", // Classic patio
    "images/landscape12.jpeg" // Classic furniture setup
  ]
};

const fallbackImage = "./images/landscape12.jpeg";
let lastUsedImage = null;

// Generate random image from static styleImages based on style preference
function getRandomImage(stylePref = "modern") {
  // Use the user's selected style or default to "modern"
  const imagePool = styleImages[stylePref] || styleImages.modern;
  // Filter out the last used image to avoid repetition
  const availableImages = imagePool.filter(image => image !== lastUsedImage);
  const selectedImages = availableImages.length > 0 ? availableImages : imagePool;
  // Select a random image from the available pool
  const selectedImage = selectedImages[Math.floor(Math.random() * selectedImages.length)] || fallbackImage;
  console.log("dfghjk"+selectedImage)
  lastUsedImage = selectedImage;
  return selectedImage;
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
  const file = event.target.files[3];
  if (file) {
    // Validate file type (only images)
    if (!file.type.startsWith("image/")) {
      const alertDiv = document.createElement("div");
      alertDiv.className = "alert alert-warning alert-dismissible fade show";
      alertDiv.role = "alert";
      alertDiv.innerHTML = `
        Please upload a valid image file (JPEG, PNG, etc.)
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      designResult.prepend(alertDiv);
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    sampleImage.src = imageUrl;
    generateBtn.classList.remove("d-none"); // Use Bootstrap's display utility
    sampleImage.onerror = () => {
      sampleImage.src = fallbackImage; // Fallback if uploaded image fails
    };
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
  totalCost.textContent = `Total: $${totalCost} / ₹${(totalCost * exchangeRate).toFixed(2)}`;
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
  questionContainer.className = "question-container mt-4 active"; // Ensure Bootstrap classes
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
      const alertDiv = document.createElement("div");
      alertDiv.className = "alert alert-warning alert-dismissible fade show";
      alertDiv.role = "alert";
      alertDiv.innerHTML = `
        Please select an option
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      questionContainer.prepend(alertDiv);
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
  // Select random image based on stylePref, default to "modern"
  const selectedStyle = answers.stylePref || "modern";
  const selectedImage = getRandomImage(selectedStyle);
  console.log("king")
  sampleImage.src = selectedImage;
  sampleImage.onerror = () => {
    sampleImage.src = fallbackImage; // Fallback if selected image fails
  };
  // Trigger AOS refresh for dynamic content
  AOS.refresh();
}