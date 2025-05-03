
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("patientForm");
  const fnameInput = document.getElementById("fname");
  const welcomeMsg = document.getElementById("welcome-msg");
  const rememberCheckbox = document.getElementById("rememberMe");
  const notYouContainer = document.getElementById("not-you-container");
  const reviewModal = document.getElementById("reviewModal");
  const reviewContent = document.getElementById("reviewContent");

  // Cookie helpers
  function setCookie(name, value, hours) {
    const expires = new Date(Date.now() + hours * 3600000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
  }

  // LocalStorage
  function saveFormData() {
    const inputs = form.querySelectorAll("input, select, textarea");
    const data = {};
    inputs.forEach(el => {
      if (el.type === "checkbox" || el.type === "radio") {
        data[el.id || el.name + el.value] = el.checked;
      } else {
        data[el.id] = el.value;
      }
    });
    localStorage.setItem("formData", JSON.stringify(data));
  }

  function loadFormData() {
    const data = JSON.parse(localStorage.getItem("formData"));
    if (data) {
      Object.entries(data).forEach(([id, val]) => {
        const el = document.getElementById(id) || document.querySelector(`[name="${id[0]}"][value="${id.slice(1)}"]`);
        if (el) {
          if (el.type === "checkbox" || el.type === "radio") {
            el.checked = val;
          } else {
            el.value = val;
          }
        }
      });
    }
  }

  function clearFormData() {
    localStorage.removeItem("formData");
  }

  function updateGreeting() {
    const name = getCookie("firstName");
    if (name) {
      welcomeMsg.innerHTML = `Welcome back, ${name}!`;
      fnameInput.value = name;
      loadFormData();
      const resetBox = document.createElement("input");
      resetBox.type = "checkbox";
      resetBox.id = "resetUser";
      const label = document.createElement("label");
      label.htmlFor = "resetUser";
      label.textContent = ` Not ${name}? Click to reset`;
      notYouContainer.appendChild(resetBox);
      notYouContainer.appendChild(label);

      resetBox.addEventListener("change", () => {
        deleteCookie("firstName");
        clearFormData();
        form.reset();
        welcomeMsg.textContent = "Welcome New User";
        notYouContainer.innerHTML = "";
      });
    }
  }

  updateGreeting();
  form.querySelectorAll("input, select, textarea").forEach(el => el.addEventListener("input", saveFormData));

  // Pain level live display
  const painSlider = document.getElementById("pain");
  const painDisplay = document.getElementById("pain-display");
  painSlider.addEventListener("input", () => {
    painDisplay.textContent = painSlider.value;
  });

  // Validation and review
  const validateBtn = document.getElementById("validate-btn");
  const submitBtn = document.getElementById("submit-btn");

  function validateForm() {
    let isValid = true;

    function check(id, condition, msg) {
      const el = document.getElementById(id);
      const err = document.getElementById(id + "-error");
      if (!condition(el.value)) {
        err.textContent = msg;
        isValid = false;
      } else {
        err.textContent = "";
      }
    }

    check("fname", v => /^[A-Za-z\-']{1,30}$/.test(v), "Invalid first name");
    check("mname", v => v === "" || /^[A-Za-z]$/.test(v), "Middle initial must be 1 letter");
    check("lname", v => /^[A-Za-z\-']{1,30}$/.test(v), "Invalid last name");
    check("email", v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Invalid email");
    check("phone", v => /^\d{3}-\d{3}-\d{4}$/.test(v), "Format must be 000-000-0000");
    check("dob", v => !!v, "Date of birth required");
    check("ssn", v => /^\d{3}-\d{2}-\d{4}$/.test(v), "SSN must be 123-45-6789 format");
    check("addr1", v => v.length > 2, "Address required");
    check("city", v => v.length > 1, "City required");
    check("state", v => v !== "", "Select state");
    check("zip", v => /^\d{5}(-\d{4})?$/.test(v), "Invalid ZIP");
    check("uid", v => /^[A-Za-z0-9_\-]{5,20}$/.test(v), "5–20 chars; no spaces");
    const p1 = document.getElementById("pword").value;
    const p2 = document.getElementById("pword2").value;
    if (p1.length < 8 || !/[A-Z]/.test(p1) || !/[a-z]/.test(p1) || !/\d/.test(p1)) {
      document.getElementById("pword-error").textContent = "Min 8 chars, upper/lower/number";
      isValid = false;
    } else {
      document.getElementById("pword-error").textContent = "";
    }
    if (p1 !== p2) {
      document.getElementById("pword2-error").textContent = "Passwords do not match";
      isValid = false;
    } else {
      document.getElementById("pword2-error").textContent = "";
    }

    return isValid;
  }

  validateBtn.addEventListener("click", () => {
    const valid = validateForm();
    submitBtn.disabled = !valid;
    if (valid) {
      const name = fnameInput.value.trim();
      if (rememberCheckbox.checked) {
        setCookie("firstName", name, 48);
      } else {
        deleteCookie("firstName");
        clearFormData();
      }
      renderReview();
    }
  });

  function renderReview() {
    const get = id => document.getElementById(id)?.value || "";
    const getRadio = name => document.querySelector(`input[name="${name}"]:checked`)?.value || "N/A";
    const illnesses = Array.from(document.querySelectorAll(".illness:checked")).map(cb => cb.value).join(", ") || "None";

    reviewContent.innerHTML = `
      <p><strong>Name:</strong> ${get("fname")} ${get("mname")} ${get("lname")}</p>
      <p><strong>Email:</strong> ${get("email")}</p>
      <p><strong>Phone:</strong> ${get("phone")}</p>
      <p><strong>DOB:</strong> ${get("dob")}</p>
      <p><strong>Gender:</strong> ${getRadio("pgender")}</p>
      <p><strong>Address:</strong> ${get("addr1")}, ${get("addr2")}, ${get("city")}, ${get("state")} ${get("zip")}</p>
      <p><strong>Medical History:</strong> ${illnesses}</p>
      <p><strong>Vaccinated:</strong> ${getRadio("vax")}</p>
      <p><strong>Symptoms:</strong> ${get("symptoms")}</p>
      <p><strong>Pain Level:</strong> ${get("pain")}/10</p>
      <p><strong>User ID:</strong> ${get("uid")}</p>
    `;
    reviewModal.style.display = "block";
  }

  document.querySelector(".close").addEventListener("click", () => {
    reviewModal.style.display = "none";
  });

  document.getElementById("editInfo").addEventListener("click", () => {
    reviewModal.style.display = "none";
  });

  document.getElementById("confirmSubmit").addEventListener("click", () => {
    alert("Form submitted!");
    reviewModal.style.display = "none";
  });

  const dateSpan = document.getElementById("dateDisplay");
  dateSpan.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  // reCAPTCHA (placeholder only)
  grecaptcha.ready(() => {
    grecaptcha.execute('your_site_key', { action: 'submit' }).then(token => {
      console.log("Recaptcha token:", token);
    });
  });
});
