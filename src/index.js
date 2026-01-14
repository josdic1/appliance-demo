import './style.css';

let templates = {};
let users = [];
let variables = {};

// ✅ Fetch data first
async function fetchData() {
  try {
    const response = await fetch("/db.json");
    if (!response.ok) throw new Error("Failed to load data");

    const data = await response.json();
    templates = data.templates;
    users = data.users;
    variables = data.variables || {};

    console.log("Data Loaded:", { templates, users, variables });

  } catch (error) {
    console.error("Error loading data:", error);
    alert("Failed to load data. Please refresh.");
  }
}

// Create help button
const helpButton = document.createElement("button");
helpButton.id = "helpButton";
helpButton.textContent = "?";
helpButton.className = "help-button";
document.body.appendChild(helpButton);

// Create help modal
const modal = document.createElement("div");
modal.id = "helpModal";
modal.className = "modal-overlay";
modal.innerHTML = `
  <div class="modal-content">
    <button id="closeModal" class="close-button">&times;</button>
    
    <h2 class="modal-title">🚗 Auto Dealer Offer Generator</h2>
    
    <p class="modal-description">
      This app helps car dealerships create professional, legally-compliant promotional offers for lease and purchase deals.
    </p>
    
    <h3 class="modal-subtitle">How it works:</h3>
    <ol class="modal-list">
      <li><strong>Select a brand</strong> from your dealership's inventory</li>
      <li><strong>Choose Lease or Buy</strong> to load the appropriate template</li>
      <li><strong>Fill in the variables</strong> (pricing, terms, dates)</li>
      <li><strong>Preview in real-time</strong> as you type</li>
      <li><strong>Submit</strong> to generate the offer</li>
    </ol>
    
    <div class="modal-note">
      <p>
        <strong>Demo Mode:</strong> You're logged in as Johnson Auto Group with access to BMW, Tesla, and Ford brands.
      </p>
    </div>
  </div>
`;
document.body.appendChild(modal);

// Modal controls
helpButton.addEventListener("mouseenter", () => {
  helpButton.style.transform = "scale(1.1)";
});
helpButton.addEventListener("mouseleave", () => {
  helpButton.style.transform = "scale(1)";
});
helpButton.addEventListener("click", () => {
  modal.style.display = "flex";
});
modal.addEventListener("click", (e) => {
  if (e.target === modal || e.target.id === "closeModal") {
    modal.style.display = "none";
  }
});

let selectedUser = null;
let selectedOfferType = null;

// --- DOM Elements ---
const logoutButton = document.getElementById("logoutButton");
const formContainer = document.getElementById("form-container");
const displayContainer = document.getElementById("display-container");

// Hide logout button initially
logoutButton.style.display = "none";

// ✅ Ensure event listeners & email function only run **after** data is loaded
fetchData().then(() => {
  // Auto-login for demo
  const demoUser = users.find(u => u.code === "1113");
  if (demoUser) {
    selectedUser = demoUser;
    displayBrandSelection(demoUser);
    logoutButton.style.display = "block";
  }

  logoutButton.addEventListener("click", handleLogout);

  // Flash the help button 10 times
  let flashCount = 0;
  const flashInterval = setInterval(() => {
    if (flashCount >= 20) {
      clearInterval(flashInterval);
      helpButton.style.transform = "scale(1)";
      return;
    }
    helpButton.style.transform = flashCount % 2 === 0 ? "scale(1.3)" : "scale(1)";
    flashCount++;
  }, 200);
});

function handleLogin() {
  const userCodeInput = document.getElementById("userCodeInput");

  if (!userCodeInput) {
    console.error("Login input field not found!");
    return;
  }

  const enteredCode = userCodeInput.value.trim();
  const user = users.find((u) => u.code === enteredCode);

  if (user) {
    selectedUser = user;
    localStorage.setItem("userCode", enteredCode);
    displayBrandSelection(user);
    logoutButton.style.display = "block";

    if (user.dealer_id === "admin") {
      displayOffersTable();
    }
  } else {
    alert("Invalid Code. Please try again.");
    userCodeInput.focus();
  }
}

function displayOffersTable() {
  if (!selectedUser) return;

  const allowedUsers = ["admin"];

  if (!allowedUsers.includes(selectedUser.dealer_id)) {
    console.log("❌ User does not have permission to view offers.");
    return;
  }

  fetch("/db.json")
    .then(response => response.json())
    .then(data => {
      const offers = data.offers;

      let tableHTML = `
        <h3>All Offers</h3>
        <table border="1">
          <thead>
            <tr>
              <th>Dealer</th>
              <th>Brand</th>
              <th>Type</th>
              <th>Offer</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
      `;

      offers.forEach(offer => {
        tableHTML += `
          <tr>
            <td>${offer.dealer_name}</td>
            <td>${offer.selectedBrand}</td>
            <td>${offer.offerType}</td>
            <td>${offer.offerText}</td>
            <td>${new Date(offer.timestamp).toLocaleString()}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>`;
      displayContainer.innerHTML += tableHTML;
    })
    .catch(error => console.error("Error fetching offers:", error));
}

function displayBrandSelection(user) {
  formContainer.innerHTML = `<h2>Welcome, ${user.dealer_name}</h2>`;

  const brandSelect = document.createElement("select");
  brandSelect.id = "brandSelect";

  user.brands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand.charAt(0).toUpperCase() + brand.slice(1);
    brandSelect.appendChild(option);
  });

  formContainer.appendChild(brandSelect);
  displayButtons();
}

function displayButtons() {
  const buttonsContainer = document.createElement("div");

  const leaseButton = document.createElement("button");
  leaseButton.textContent = "Lease";
  leaseButton.addEventListener("click", () => {
    selectedOfferType = "lease";
    displayTemplate(selectedOfferType);
  });

  const buyButton = document.createElement("button");
  buyButton.textContent = "Buy";
  buyButton.addEventListener("click", () => {
    selectedOfferType = "buy";
    displayTemplate(selectedOfferType);
  });

  buttonsContainer.appendChild(leaseButton);
  buttonsContainer.appendChild(buyButton);
  formContainer.appendChild(buttonsContainer);
}

function displayTemplate(type) {
  if (!templates || Object.keys(templates).length === 0) {
    alert("Templates not loaded yet. Please wait.");
    return;
  }

  displayContainer.innerHTML = "";
  const brand = document.getElementById("brandSelect").value;
  const offerTemplate = templates[brand]?.[type];

  if (!offerTemplate) {
    alert("No template found for this selection.");
    return;
  }

  const offerPreview = document.createElement("div");
  offerPreview.id = "offer-preview";
  offerPreview.textContent = offerTemplate;
  displayContainer.appendChild(offerPreview);

  displayForm(type);
}

function displayForm(type) {
  const brand = document.getElementById("brandSelect").value;
  const templateString = templates[brand]?.[type];

  if (!templateString) {
    alert("Error: Template not found.");
    return;
  }

  const brandVariables = variables[brand] || {};
  const placeholders = [...new Set(
    [...templates[brand][type].matchAll(/\{\s*([^}]+?)\s*\}/g)].map(match => match[1])
  )];

  let formHTML = `<h3>Fill in the variables for ${type === "lease" ? "Lease" : "Buy"}:</h3>
    <form id="templateForm">`;

  placeholders.forEach((variable) => {
    let defaultValue = brandVariables[variable] || "";

    let inputClass = "";
    if (variable.includes("MONTHLY_PAYMENT") || variable.includes("DOWN_PAYMENT")) {
      inputClass = "currency-input";
    } else if (variable.includes("APR_RATE")) {
      inputClass = "percentage-input";
    } else if (variable.includes("TERM") || variable.includes("MONTHS")) {
      inputClass = "month-input";
    }

    formHTML += `
      <label for="${variable}">${variable}:</label>
      <input type="text" id="${variable}" class="dynamic-input ${inputClass}" placeholder="Enter ${variable}" value="${defaultValue}" /><br>
    `;
  });

  formHTML += `
    <button type="button" id="confirmOffer" disabled>Confirm Offer</button>
    <button type="button" id="cancelForm">Home</button>
  </form>`;

  displayContainer.innerHTML += formHTML;

  document.querySelectorAll(".dynamic-input").forEach(input => {
    input.addEventListener("input", () => {
      checkFormCompletion();
      updateTemplatePreview(type);
    });
  });

  document.getElementById("confirmOffer").addEventListener("click", handleSubmitOffer);
  document.getElementById("cancelForm").addEventListener("click", () => {
    displayContainer.innerHTML = "";
  });

  updateTemplatePreview(type);
}

function checkFormCompletion() {
  const inputs = document.querySelectorAll(".dynamic-input");
  const allFilled = Array.from(inputs).every(input => input.value.trim() !== "");
  document.getElementById("confirmOffer").disabled = !allFilled;
}

function updateTemplatePreview(type) {
  const brand = document.getElementById("brandSelect").value;
  let updatedTemplate = templates[brand][type];

  document.querySelectorAll(".dynamic-input").forEach(input => {
    const key = input.id;
    const value = input.value.trim() || `{${key}}`;
    updatedTemplate = updatedTemplate.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });

  document.getElementById("offer-preview").textContent = updatedTemplate;
}

document.addEventListener("input", (event) => {
  if (event.target.classList.contains("currency-input")) {
    formatCurrency(event.target);
  } else if (event.target.classList.contains("percentage-input")) {
    formatPercentage(event.target);
  } else if (event.target.classList.contains("month-input")) {
    formatMonths(event.target);
  }
});

function formatCurrency(input) {
  let value = input.value.replace(/[^0-9.]/g, "");
  if (value.startsWith("$")) value = value.slice(1);
  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }
  input.value = value ? `$${value}` : "";
}

function formatPercentage(input) {
  let value = input.value.replace(/[^0-9.]/g, "");
  if (value.endsWith("%")) value = value.slice(0, -1);
  input.value = value ? `${value}%` : "";
}

function formatMonths(input) {
  let value = input.value.replace(/[^0-9]/g, "");
  if (value.endsWith(" months")) value = value.replace(" months", "");
  input.value = value ? `${value} months` : "";
}

async function handleSubmitOffer() {
  const brand = document.getElementById("brandSelect").value;
  let offerText = templates[brand][selectedOfferType];

  if (!offerText) {
    alert("Error: Offer template not found.");
    return;
  }

  document.querySelectorAll(".dynamic-input").forEach(input => {
    const key = input.id;
    const value = input.value.trim() || `{${key}}`;
    offerText = offerText.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });

  const offerData = {
    id: Date.now().toString(),
    dealer_name: selectedUser.dealer_name,
    dealer_email: selectedUser.email,
    dealer_id: selectedUser.dealer_id,
    selectedBrand: brand,
    offerType: selectedOfferType,
    offerText: offerText,
    timestamp: new Date().toISOString()
  };

  console.log("📧 Demo Mode - Offer created:", offerData);
  
  showOfferModal(offerText, brand);
  displayContainer.innerHTML = "";
}

function showOfferModal(offerText, brand) {
  const offerModal = document.createElement("div");
  offerModal.id = "offerModal";
  offerModal.className = "modal-overlay offer-modal";
  
  offerModal.innerHTML = `
    <div class="modal-content offer-modal-content">
      <div class="offer-header">
        <div class="offer-checkmark">✅</div>
        <h2>Offer Created!</h2>
        <p class="offer-subtitle">${brand.charAt(0).toUpperCase() + brand.slice(1)} ${selectedOfferType === 'lease' ? 'Lease' : 'Purchase'} Offer</p>
      </div>
      
      <div class="offer-text-container">
        <p id="offerTextContent">${offerText}</p>
      </div>
      
      <button id="copyBtn" class="copy-button">
        <span>📋</span> Copy to Clipboard
      </button>
      
      <p class="close-hint">Click anywhere outside to close</p>
    </div>
  `;
  
  document.body.appendChild(offerModal);
  
  // Trigger animation
  setTimeout(() => offerModal.classList.add("visible"), 10);
  
  const copyBtn = offerModal.querySelector("#copyBtn");
  copyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(offerText).then(() => {
      copyBtn.innerHTML = "<span>✅</span> Copied!";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.innerHTML = "<span>📋</span> Copy to Clipboard";
        copyBtn.classList.remove("copied");
      }, 2000);
    });
  });
  
  offerModal.addEventListener("click", (e) => {
    if (e.target === offerModal) {
      offerModal.classList.remove("visible");
      setTimeout(() => offerModal.remove(), 300);
    }
  });
}

function handleLogout() {
  localStorage.removeItem("userCode");
  selectedUser = null;

  formContainer.innerHTML = `
    <h2>Login</h2>
    <input type="text" id="userCodeInput" placeholder="Enter Code" maxlength="10" />
    <button id="submitCode">Submit</button>
  `;
  displayContainer.innerHTML = "";
  logoutButton.style.display = "none";

  document.getElementById("submitCode").addEventListener("click", handleLogin);
  document.getElementById("userCodeInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleLogin();
  });
}