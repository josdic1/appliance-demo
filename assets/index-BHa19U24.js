(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))l(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const m of r.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&l(m)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function l(o){if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();let i={},y=[],v={};async function B(){try{const t=await fetch("./db.json");if(!t.ok)throw new Error("Failed to load data");const e=await t.json();i=e.templates,y=e.users,v=e.variables||{},console.log("Data Loaded:",{templates:i,users:y,variables:v})}catch(t){console.error("Error loading data:",t),alert("Failed to load data. Please refresh.")}}const s=document.createElement("button");s.id="helpButton";s.textContent="?";s.className="help-button";document.body.appendChild(s);const d=document.createElement("div");d.id="helpModal";d.className="modal-overlay";d.innerHTML=`
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
`;document.body.appendChild(d);s.addEventListener("mouseenter",()=>{s.style.transform="scale(1.1)"});s.addEventListener("mouseleave",()=>{s.style.transform="scale(1)"});s.addEventListener("click",()=>{d.style.display="flex"});d.addEventListener("click",t=>{(t.target===d||t.target.id==="closeModal")&&(d.style.display="none")});let c=null,u=null;const p=document.getElementById("logoutButton"),g=document.getElementById("form-container"),f=document.getElementById("display-container");p.style.display="none";B().then(()=>{const t=y.find(l=>l.code==="1113");t&&(c=t,C(t),p.style.display="block"),p.addEventListener("click",A);let e=0;const n=setInterval(()=>{if(e>=20){clearInterval(n),s.style.transform="scale(1)";return}s.style.transform=e%2===0?"scale(1.3)":"scale(1)",e++},200)});function b(){const t=document.getElementById("userCodeInput");if(!t){console.error("Login input field not found!");return}const e=t.value.trim(),n=y.find(l=>l.code===e);n?(c=n,localStorage.setItem("userCode",e),C(n),p.style.display="block",n.dealer_id==="admin"&&M()):(alert("Invalid Code. Please try again."),t.focus())}function M(){if(!c)return;if(!["admin"].includes(c.dealer_id)){console.log("❌ User does not have permission to view offers.");return}fetch("/db.json").then(e=>e.json()).then(e=>{const n=e.offers;let l=`
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
      `;n.forEach(o=>{l+=`
          <tr>
            <td>${o.dealer_name}</td>
            <td>${o.selectedBrand}</td>
            <td>${o.offerType}</td>
            <td>${o.offerText}</td>
            <td>${new Date(o.timestamp).toLocaleString()}</td>
          </tr>
        `}),l+="</tbody></table>",f.innerHTML+=l}).catch(e=>console.error("Error fetching offers:",e))}function C(t){g.innerHTML=`<h2>Welcome, ${t.dealer_name}</h2>`;const e=document.createElement("select");e.id="brandSelect",t.brands.forEach(n=>{const l=document.createElement("option");l.value=n,l.textContent=n.charAt(0).toUpperCase()+n.slice(1),e.appendChild(l)}),g.appendChild(e),S()}function S(){const t=document.createElement("div"),e=document.createElement("button");e.textContent="Lease",e.addEventListener("click",()=>{u="lease",E(u)});const n=document.createElement("button");n.textContent="Buy",n.addEventListener("click",()=>{u="buy",E(u)}),t.appendChild(e),t.appendChild(n),g.appendChild(t)}function E(t){var o;if(!i||Object.keys(i).length===0){alert("Templates not loaded yet. Please wait.");return}f.innerHTML="";const e=document.getElementById("brandSelect").value,n=(o=i[e])==null?void 0:o[t];if(!n){alert("No template found for this selection.");return}const l=document.createElement("div");l.id="offer-preview",l.textContent=n,f.appendChild(l),w(t)}function w(t){var m;const e=document.getElementById("brandSelect").value;if(!((m=i[e])==null?void 0:m[t])){alert("Error: Template not found.");return}const l=v[e]||{},o=[...new Set([...i[e][t].matchAll(/\{\s*([^}]+?)\s*\}/g)].map(a=>a[1]))];let r=`<h3>Fill in the variables for ${t==="lease"?"Lease":"Buy"}:</h3>
    <form id="templateForm">`;o.forEach(a=>{let T=l[a]||"",h="";a.includes("MONTHLY_PAYMENT")||a.includes("DOWN_PAYMENT")?h="currency-input":a.includes("APR_RATE")?h="percentage-input":(a.includes("TERM")||a.includes("MONTHS"))&&(h="month-input"),r+=`
      <label for="${a}">${a}:</label>
      <input type="text" id="${a}" class="dynamic-input ${h}" placeholder="Enter ${a}" value="${T}" /><br>
    `}),r+=`
    <button type="button" id="confirmOffer" disabled>Confirm Offer</button>
    <button type="button" id="cancelForm">Home</button>
  </form>`,f.innerHTML+=r,document.querySelectorAll(".dynamic-input").forEach(a=>{a.addEventListener("input",()=>{I(),L(t)})}),document.getElementById("confirmOffer").addEventListener("click",H),document.getElementById("cancelForm").addEventListener("click",()=>{f.innerHTML=""}),L(t)}function I(){const t=document.querySelectorAll(".dynamic-input"),e=Array.from(t).every(n=>n.value.trim()!=="");document.getElementById("confirmOffer").disabled=!e}function L(t){const e=document.getElementById("brandSelect").value;let n=i[e][t];document.querySelectorAll(".dynamic-input").forEach(l=>{const o=l.id,r=l.value.trim()||`{${o}}`;n=n.replace(new RegExp(`\\{${o}\\}`,"g"),r)}),document.getElementById("offer-preview").textContent=n}document.addEventListener("input",t=>{t.target.classList.contains("currency-input")?O(t.target):t.target.classList.contains("percentage-input")?$(t.target):t.target.classList.contains("month-input")&&k(t.target)});function O(t){let e=t.value.replace(/[^0-9.]/g,"");e.startsWith("$")&&(e=e.slice(1));const n=e.split(".");n.length>2&&(e=n[0]+"."+n.slice(1).join("")),t.value=e?`$${e}`:""}function $(t){let e=t.value.replace(/[^0-9.]/g,"");e.endsWith("%")&&(e=e.slice(0,-1)),t.value=e?`${e}%`:""}function k(t){let e=t.value.replace(/[^0-9]/g,"");e.endsWith(" months")&&(e=e.replace(" months","")),t.value=e?`${e} months`:""}async function H(){const t=document.getElementById("brandSelect").value;let e=i[t][u];if(!e){alert("Error: Offer template not found.");return}document.querySelectorAll(".dynamic-input").forEach(l=>{const o=l.id,r=l.value.trim()||`{${o}}`;e=e.replace(new RegExp(`\\{${o}\\}`,"g"),r)});const n={id:Date.now().toString(),dealer_name:c.dealer_name,dealer_email:c.email,dealer_id:c.dealer_id,selectedBrand:t,offerType:u,offerText:e,timestamp:new Date().toISOString()};console.log("📧 Demo Mode - Offer created:",n),x(e,t),f.innerHTML=""}function x(t,e){const n=document.createElement("div");n.id="offerModal",n.className="modal-overlay offer-modal",n.innerHTML=`
    <div class="modal-content offer-modal-content">
      <div class="offer-header">
        <div class="offer-checkmark">✅</div>
        <h2>Offer Created!</h2>
        <p class="offer-subtitle">${e.charAt(0).toUpperCase()+e.slice(1)} ${u==="lease"?"Lease":"Purchase"} Offer</p>
      </div>
      
      <div class="offer-text-container">
        <p id="offerTextContent">${t}</p>
      </div>
      
      <button id="copyBtn" class="copy-button">
        <span>📋</span> Copy to Clipboard
      </button>
      
      <p class="close-hint">Click anywhere outside to close</p>
    </div>
  `,document.body.appendChild(n),setTimeout(()=>n.classList.add("visible"),10);const l=n.querySelector("#copyBtn");l.addEventListener("click",o=>{o.stopPropagation(),navigator.clipboard.writeText(t).then(()=>{l.innerHTML="<span>✅</span> Copied!",l.classList.add("copied"),setTimeout(()=>{l.innerHTML="<span>📋</span> Copy to Clipboard",l.classList.remove("copied")},2e3)})}),n.addEventListener("click",o=>{o.target===n&&(n.classList.remove("visible"),setTimeout(()=>n.remove(),300))})}function A(){localStorage.removeItem("userCode"),c=null,g.innerHTML=`
    <h2>Login</h2>
    <input type="text" id="userCodeInput" placeholder="Enter Code" maxlength="10" />
    <button id="submitCode">Submit</button>
  `,f.innerHTML="",p.style.display="none",document.getElementById("submitCode").addEventListener("click",b),document.getElementById("userCodeInput").addEventListener("keypress",t=>{t.key==="Enter"&&b()})}
