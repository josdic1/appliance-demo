import './style.css';
import emailjs from "emailjs-com";

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

// ✅ Ensure event listeners & email function only run **after** data is loaded
fetchData().then(() => {
  // Attach event listeners **AFTER** data is loaded
  document.getElementById("submitCode").addEventListener("click", handleLogin);
  document.getElementById("userCodeInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  logoutButton.addEventListener("click", handleLogout);
});

// ====================================
// ✅ Place this function BELOW fetchData(), ABOVE handleSubmitOffer()
// ====================================
async function sendEmailToUser(dealerId) {
  // Ensure `users` is loaded before running this function
  if (!users || users.length === 0) {
    console.error("❌ Users data not loaded yet!");
    alert("Users not loaded. Please try again later.");
    return;
  }

  // Find the user by dealer_id
  const user = users.find(u => u.dealer_id === dealerId);

  if (!user) {
    alert("User not found!");
    return;
  }

  const emailData = {
    dealer_name: user.dealer_name,
    dealer_email: user.email,  // ✅ User's email from JSON
    message: `Hello ${user.dealer_name}, this is a test email!`,
    timestamp: new Date().toISOString()
  };

  try {
    console.log("📧 Sending EmailJS Data:", emailData);

    await emailjs.send(
      "service_y04y7fh",  // ✅ Your Service ID
      "template_4g4ajbg", // ✅ Your Template ID
      emailData,
      "Qr8ucWUkLFcYYKujc"  // ✅ Your Public Key
    );

    alert(`Email sent to ${user.email}!`);
  } catch (error) {
    console.error("❌ EmailJS Error:", error);
    alert("Failed to send email.");
  }
}

// ====================================
// ✅ Example Usage: Call this when needed
// ====================================
// This sends an email to Thunder Mercedes of Union (user with dealer_id: "mercedes_dealer_001")




let selectedUser = null;
let selectedOfferType = null;

// --- DOM Elements ---
const submitButton = document.getElementById("submitCode");
const logoutButton = document.getElementById("logoutButton");
const formContainer = document.getElementById("form-container");
const displayContainer = document.getElementById("display-container");

// Hide logout button initially
logoutButton.style.display = "none";

// --- Event Listeners ---
submitButton.addEventListener("click", handleLogin);
logoutButton.addEventListener("click", handleLogout);
document.getElementById("userCodeInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleLogin();
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

    // ✅ Only display offers if the user is authorized
    if (user.dealer_id === "admin") {
      displayOffersTable();
    }
  } else {
    alert("Invalid Code. Please try again.");
    userCodeInput.focus();
  }
}




// ✅ Function to Display Offers in a Table
function displayOffersTable() {
  if (!selectedUser) return;

  // ✅ Define which users can see all offers
  const allowedUsers = ["admin"]; // Add dealer IDs that can see all offers

  if (!allowedUsers.includes(selectedUser.dealer_id)) {
    console.log("❌ User does not have permission to view offers.");
    return; // Exit if the user isn't allowed
  }

  // ✅ Fetch offers from db.json
  fetch("/db.json")
    .then(response => response.json())
    .then(data => {
      const offers = data.offers;

      // ✅ Create Table
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

      // ✅ Loop through offers and add them to the table
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

      // ✅ Display Table in the Page
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

    // Determine input type based on variable name
    let inputClass = "";
    if (variable.includes("MONTHLY_PAYMENT") || variable.includes("DOWN_PAYMENT")) {
      inputClass = "currency-input";  // Format as currency ($)
    } else if (variable.includes("APR_RATE")) {
      inputClass = "percentage-input";  // Format as percentage (%)
    } else if (variable.includes("TERM") || variable.includes("MONTHS")) {
      inputClass = "month-input";  // Format as months
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

  // ✅ Attach event listeners **AFTER** the inputs have been added to the DOM
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

// ✅ Attach formatting event listeners **AFTER** inputs are created
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
  let value = input.value.replace(/[^0-9.]/g, ""); // Remove non-numeric chars except "."

  if (value.startsWith("$")) value = value.slice(1); // Remove existing "$"

  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join(""); // Ensure only one "."
  }

  input.value = value ? `$${value}` : ""; // Add "$" only once
}

function formatPercentage(input) {
  let value = input.value.replace(/[^0-9.]/g, ""); // Remove non-numeric chars

  if (value.endsWith("%")) value = value.slice(0, -1); // Remove existing "%"

  input.value = value ? `${value}%` : ""; // Add "%" only once
}

function formatMonths(input) {
  let value = input.value.replace(/[^0-9]/g, ""); // Allow only numbers

  if (value.endsWith(" months")) value = value.replace(" months", ""); // Remove duplicate

  input.value = value ? `${value} months` : ""; // Add "months" only once
}



async function handleSubmitOffer() {
  const brand = document.getElementById("brandSelect").value;
  let offerText = templates[brand][selectedOfferType];

  if (!offerText) {
    alert("Error: Offer template not found.");
    return;
  }

  // ✅ Replace placeholders with actual values from the form
  document.querySelectorAll(".dynamic-input").forEach(input => {
    const key = input.id;
    const value = input.value.trim() || `{${key}}`;  // Avoid leaving placeholders
    offerText = offerText.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });

  console.log("✅ Final offerText before sending:", offerText); // 🔍 Debugging Step

  const offerData = {
    dealer_name: selectedUser.dealer_name,
    dealer_email: selectedUser.email,
    dealer_id: selectedUser.dealer_id,
    selectedBrand: brand,
    offerType: selectedOfferType,
    offerText: offerText, // ✅ Now fully replaced
    timestamp: new Date().toISOString()
  };

  try {
    // ✅ Step 1: Save offer to db.json
    const response = await fetch("http://localhost:3000/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(offerData)
    });

    if (!response.ok) throw new Error("Failed to save offer");
    console.log("📧 Sending EmailJS Data:", {
      dealer_name: offerData.dealer_name,
      dealer_email: offerData.dealer_email,
      selectedBrand: offerData.selectedBrand,
      offerType: offerData.offerType,
      offerText: offerData.offerText,  // ✅ Ensure it's included
      timestamp: offerData.timestamp
    });


    // ✅ Step 2: Ensure EmailJS receives the correct offerText
    await emailjs.send(
      "service_y04y7fh",  // ✅ Your Service ID
      "template_4g4ajbg", // ✅ Your Template ID
      {
        dealer_name: offerData.dealer_name,
        dealer_email: offerData.dealer_email,
        selectedBrand: offerData.selectedBrand,
        offerType: offerData.offerType,
        offerText: offerData.offerText,  // ✅ Make sure this is fully replaced
        timestamp: offerData.timestamp
      },
      "Qr8ucWUkLFcYYKujc"  // ✅ Your Public Key
    );

    alert("Offer successfully submitted and email sent!");
    displayContainer.innerHTML = ""; // Clear form after submit
  } catch (error) {
    alert("Error submitting offer: " + error.message);
  }
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

  // ✅ Reattach event listeners to the newly created elements
  document.getElementById("submitCode").addEventListener("click", handleLogin);
  document.getElementById("userCodeInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleLogin();
  });
}

