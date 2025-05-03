document.addEventListener("DOMContentLoaded", () => {
  const fnameInput = document.getElementById("fname");
  const greetingDiv = document.getElementById("greeting");
  const rememberMe = document.getElementById("rememberMe");
  const notYouContainer = document.getElementById("not-you-container");
  const submitBtn = document.getElementById("submit-btn");
  const validateBtn = document.getElementById("review-btn");

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

  function saveFormData() {
    const inputs = document.querySelectorAll('#patientForm input, #patientForm select, #patientForm textarea');
    let data = {};
    inputs.forEach(input => { data[input.id] = input.value });
    localStorage.setItem("formData", JSON.stringify(data));
  }

  function loadFormData() {
    const data = JSON.parse(localStorage.getItem("formData"));
    if (data) {
      Object.keys(data).forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = data[id];
      });
    }
  }

  function clearFormData() {
    localStorage.removeItem("formData");
  }

  function updateGreeting() {
    const name = getCookie("firstName");
    if (name) {
      greetingDiv.innerHTML = \`Welcome back, \${name}! <label><input type="checkbox" id="resetUser"> Not \${name}?</label>\`;
      fnameInput.value = name;
      loadFormData();
      document.getElementById("resetUser").addEventListener("change", () => {
        deleteCookie("firstName");
        clearFormData();
        document.getElementById("patientForm").reset();
        greetingDiv.textContent = "Welcome New User";
        notYouContainer.innerHTML = "";
      });
    }
  }

  updateGreeting();

  document.querySelectorAll('#patientForm input, #patientForm select, #patientForm textarea').forEach(input => {
    input.addEventListener("input", saveFormData);
  });

  validateBtn.addEventListener("click", () => {
    const name = fnameInput.value.trim();
    if (name && rememberMe.checked) {
      setCookie("firstName", name, 48);
    } else {
      deleteCookie("firstName");
    }
    submitBtn.disabled = false;

    const content = document.getElementById("reviewContent");
    content.innerHTML = \`<p><strong>First Name:</strong> \${name}</p>\`;
    document.getElementById("reviewModal").style.display = "block";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("reviewModal").style.display = "none";
  });

  document.getElementById("editInfo").addEventListener("click", () => {
    document.getElementById("reviewModal").style.display = "none";
  });

  document.getElementById("confirmSubmit").addEventListener("click", () => {
    alert("Form submitted!");
    document.getElementById("reviewModal").style.display = "none";
  });

  document.getElementById("dateDisplay").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
});
