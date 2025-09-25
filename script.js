// Initialize AOS animations
AOS.init({ duration: 1000 });
console.log("works")

// DOM elements
// Removed decodeBtn + fileInput completely ✅
const sampleImage = document.getElementById("sampleImage");
const generateBtn = document.getElementById("generateBtn");
const designResult = document.getElementById("designResult");
const customBtn = document.getElementById("customBtn");
const questionContainer = document.getElementById("questionContainer");

// Predefined static images mapped to style preferences (12 images, 4 per style)
const styleImages = {
  modern: ["images/landscape1.jpeg","images/landscape2.jpeg","images/landscape3.jpeg","images/landscape4.jpeg"],
  rustic: ["images/landscape5.jpeg","images/landscape6.jpeg","images/landscape7.jpeg","images/landscape8.jpeg"],
  classic: ["images/landscape9.jpeg","images/landscape10.jpeg","images/landscape11.jpeg","images/landscape12.jpeg"]
};

const fallbackImage = "./images/landscape12.jpeg";
let lastUsedImage = null;

// Generate random image from static styleImages based on style preference
function getRandomImage(stylePref = "modern") {
  const imagePool = styleImages[stylePref] || styleImages.modern;
  const availableImages = imagePool.filter(image => image !== lastUsedImage);
  const selectedImages = availableImages.length > 0 ? availableImages : imagePool;
  const selectedImage = selectedImages[Math.floor(Math.random() * selectedImages.length)] || fallbackImage;
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

// ✅ Removed all decodeBtn + fileInput upload logic here

// Generate default design costs (manual button)
generateBtn.addEventListener("click", () => {
  designResult.innerHTML = "<h3>Estimated Costs:</h3>";
  const ul = document.createElement("ul");
  ul.className = "list-unstyled";
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
  total.className = "total-cost mt-3";
  total.textContent = `Total: $${totalCost} / ₹${(totalCost * exchangeRate).toFixed(2)}`;
  designResult.appendChild(total);
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
  hideDecodedSection(); // 👈 Hide decoded result if showing
  showQuestion();
});

function showQuestion() {
  if (currentQ >= questions.length) {
    showResults();
    return;
  }

  const q = questions[currentQ];
  questionContainer.className = "question-container mt-4 active";
  questionContainer.innerHTML = `
    <p class="mb-2">${q.question}</p>
    <select class="form-select mb-3" aria-label="Select ${q.key}">
      <option value="">Select...</option>
      ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join("")}
    </select>
  `;

  const nextBtn = document.createElement("button");
  nextBtn.className = "next-btn btn btn-primary";
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
  AOS.refresh();
}

// Main logic for generating Custom Design Results
function showResults() {
  questionContainer.classList.remove("active");
  hideDecodedSection(); // 👈 Hide upload-to-decode section if showing

  const selectedStyle = answers.stylePref || "modern";
  const selectedImage = getRandomImage(selectedStyle);

  // Elements
  const customResultSection = document.getElementById("customResultSection");
  const customResultImage = document.getElementById("customResultImage");
  const customBOMBody = document.getElementById("customBOMBody");
  const customTotal = document.getElementById("customTotal");

  // Reset any previous
  customBOMBody.innerHTML = "";
  customResultSection.style.display = "block";
  customResultImage.src = selectedImage;
  customResultImage.onerror = () => { customResultImage.src = fallbackImage; };

  let grandTotal = 0;

  Object.entries(answers).forEach(([key, value]) => {
    let qty = Math.floor(Math.random() * 10) + 1;
    let pricePerItem = 0;
    let qtyDisplay = qty;
    let priceDisplay = "";
    let totalDisplay = "";
    let rowTotal = 0;

    if (key === "stylePref") {
      qtyDisplay = "-";
      if (value === "modern") pricePerItem = 6000;
      else if (value === "rustic") pricePerItem = 5500;
      else if (value === "classic") pricePerItem = 5700;
      else pricePerItem = 5000;

      rowTotal = pricePerItem;
      priceDisplay = `₹${pricePerItem.toLocaleString()}`;
      totalDisplay = `₹${rowTotal.toLocaleString()}`;
      grandTotal += rowTotal;
    }
    else if (key === "plants" && value === "none") {
      qtyDisplay = priceDisplay = totalDisplay = "-";
      rowTotal = 0;
    }
    else if (key === "plants") {
      pricePerItem = value === "lots" ? 300 : 200;
      rowTotal = qty * pricePerItem;
      priceDisplay = `₹${pricePerItem.toLocaleString()}`;
      totalDisplay = `₹${rowTotal.toLocaleString()}`;
      grandTotal += rowTotal;
    }
    else if (key === "furniture") {
      pricePerItem = value === "sofa" ? 7000 : value === "dining" ? 5000 : 4000;
      rowTotal = qty * pricePerItem;
      priceDisplay = `₹${pricePerItem.toLocaleString()}`;
      totalDisplay = `₹${rowTotal.toLocaleString()}`;
      grandTotal += rowTotal;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${capitalize(key)}: ${capitalize(value)}</td>
      <td>${qtyDisplay}</td>
      <td>${priceDisplay}</td>
      <td>${totalDisplay}</td>
    `;
    customBOMBody.appendChild(tr);
  });

  customTotal.textContent = `₹${grandTotal.toLocaleString()}`;

  // 👉 Enable editing for custom BOM
  makeQuantityEditable("customBOMBody", "customTotal");

  AOS.refresh();
}

// Helper to hide decoded section when switching
function hideDecodedSection() {
  const decodedSection = document.getElementById("decodedSection");
  if (decodedSection) decodedSection.style.display = "none";
}

// Helper: capitalize first letter
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// How it works: Reveal elements on scroll
document.addEventListener("scroll", () => {
  document.querySelectorAll(".animate").forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      el.classList.add("visible");
    }
  });
});

// upload to decode
const fileInput = document.getElementById("fileInput");
const decodeBtn = document.getElementById("decodeBtn");
const decodedSection = document.getElementById("decodedSection");
const decodedImagePreview = document.getElementById("decodedImagePreview");
const decodedBOMBody = document.getElementById("decodedBOMBody");
const decodedTotal = document.getElementById("decodedTotal");

// Simulated detection catalog
const possibleItems = {
  plant: { minPrice: 150, maxPrice: 450 },
  furniture: { minPrice: 2500, maxPrice: 6000 },
  grass: { minPrice: 800, maxPrice: 1500 },
  pot: { minPrice: 200, maxPrice: 700 },
  light: { minPrice: 500, maxPrice: 2000 },
  rug: { minPrice: 1200, maxPrice: 3000 },
  tiles: { minPrice: 1000, maxPrice: 2500 }
};

// Simulated ML Detection
// Predefined static data for specific uploaded images
const staticBOMData = {
  "images/uploadimage1.png": [
    "lights",
    "Plants & Greenery",
    "Rug",
    "sofa with cushions",
    "coffee table",
    "wooden arm chair",
    "floor lamp"
  ],
  "images/uploadimage2.jpeg": [
    "plants",
    "furniture",
    "Wall Decor",
    "lights",
    "Flooring & Rugs"
  ],
  "images/uploadimage3.png": [
    "swing chair",
    "green grass carpet",
    "hanging pendant lamp",
    "lightings",
    "potted plants and creepers"
  ]
};

// Updated ML Detection function
function detectItemsFromImage(filename) {
  // Check if the uploaded file matches a static BOM
  for (const key in staticBOMData) {
    if (filename.includes(key.split("/").pop())) { // match by filename only
      return staticBOMData[key]; // return predefined static items
    }
  }

  // Existing random logic for other files
  const keys = Object.keys(possibleItems);
  const lower = filename.toLowerCase();
  const detected = [];

  if (lower.includes("plant") || lower.includes("green")) detected.push("plant");
  if (lower.includes("furniture") || lower.includes("chair") || lower.includes("sofa")) detected.push("furniture");
  if (lower.includes("grass") || lower.includes("lawn")) detected.push("grass");
  if (lower.includes("pot")) detected.push("pot");
  if (lower.includes("light")) detected.push("light");
  if (lower.includes("rug")) detected.push("rug");
  if (lower.includes("tile")) detected.push("tiles");
  if (lower.includes("umbrella")) detected.push("umbrella");
  if (lower.includes("wall")) detected.push("wallDecor");
  if (lower.includes("water") || lower.includes("fountain")) detected.push("waterFeature");

  if (detected.length === 0) {
    const shuffled = [...keys].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }
  return [...new Set(detected)].slice(0, 6);
}

// Decode button logic
decodeBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  customResultSection.style.display = "none"; 

  const reader = new FileReader();
  reader.onload = function (event) {
    customResultSection.style.display = "none";
    decodedImagePreview.src = event.target.result;
    decodedSection.style.display = "block";

    document.getElementById("bomTableContainer").style.display = "none";
    const generateBtn = document.getElementById("generateBOMBtn");
    generateBtn.disabled = false;

    const detectedItems = detectItemsFromImage(file.name);

  generateBtn.onclick = () => {
  decodedBOMBody.innerHTML = "";
  let total = 0;

  detectedItems.forEach(item => {
    const qty = Math.floor(Math.random() * 6) + 2;

    // Check if item exists in possibleItems, else assign a default random price
    let price = 0;
    if (possibleItems[item]) {
      price = Math.floor(Math.random() * (possibleItems[item].maxPrice - possibleItems[item].minPrice + 1)) + possibleItems[item].minPrice;
    } else {
      price = Math.floor(Math.random() * (3000 - 500 + 1)) + 500; // default random price for static items
    }

    const totalItemPrice = qty * price;
    total += totalItemPrice;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${capitalize(item)}</td>
      <td>${qty}</td>
      <td>₹${price}</td>
      <td>₹${totalItemPrice}</td>
    `;
    decodedBOMBody.appendChild(row);
  });

  decodedTotal.textContent = `₹${total.toLocaleString()}`;
  document.getElementById("bomTableContainer").style.display = "block";
  generateBtn.disabled = true;

  // Enable editing for decoded BOM
  makeQuantityEditable("decodedBOMBody", "decodedTotal");

  AOS.refresh();
};

  };
  reader.readAsDataURL(file);
});

// contact form
const contactBtn = document.querySelector('a.btn.btn-success[data-aos="zoom-in"]'); 
const contactOverlay = document.getElementById("contactOverlay");
const closeContact = document.getElementById("closeContact");

if (contactBtn) {
  contactBtn.addEventListener("click", (e) => {
    e.preventDefault();
    contactOverlay.style.display = "flex";
  });
}

if (closeContact) {
  closeContact.addEventListener("click", () => {
    contactOverlay.style.display = "none";
  });
}

contactOverlay.addEventListener("click", (e) => {
  if (e.target === contactOverlay) {
    contactOverlay.style.display = "none";
  }
});

// Handle Contact Form Submit
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault(); // stop normal form submission

    // Close overlay
    contactOverlay.style.display = "none";

    // Show SweetAlert success message
    Swal.fire({
      title: "Submitted Successfully!",
      text: "Thanks for contacting us. We’ll get back to you soon.",
      icon: "success",
      confirmButtonText: "OK",
      showClass: {
        popup: "animate__animated animate__fadeInDown"
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp"
      }
    });

    // Reset form fields
    contactForm.reset();
  });
}


// 🔹 Quantity Editable Function
function makeQuantityEditable(tableBodyId, totalId) {
  const tableBody = document.getElementById(tableBodyId);
  const totalEl = document.getElementById(totalId);

  if (!tableBody) return;

  tableBody.querySelectorAll("td:nth-child(2)").forEach((cell) => {
    if (cell.textContent.trim() === "-" || cell.querySelector("input")) return;

    const oldValue = cell.textContent.trim();
    cell.innerHTML = `<input type="number" min="0" value="${oldValue}" class="form-control form-control-sm text-center">`;

    const input = cell.querySelector("input");
    input.addEventListener("input", () => {
      const row = cell.parentElement;
      const qty = parseInt(input.value) || 0;

      const priceCell = row.children[2];
      const totalCell = row.children[3];

      const price = parseInt(priceCell.textContent.replace(/[₹,]/g, "")) || 0;
      const newRowTotal = qty * price;

      totalCell.textContent = `₹${newRowTotal.toLocaleString()}`;

      let newGrand = 0;
      tableBody.querySelectorAll("tr").forEach((r) => {
        const val = parseInt(r.children[3].textContent.replace(/[₹,]/g, "")) || 0;
        newGrand += val;
      });
      totalEl.textContent = `₹${newGrand.toLocaleString()}`;
    });
  });
}
