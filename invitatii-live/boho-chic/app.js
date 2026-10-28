const form = document.getElementById("rsvp-form");

if (form) {
  const presenceInputs = Array.from(form.querySelectorAll('input[name="prezenta"]'));
  const choiceCards = Array.from(form.querySelectorAll("[data-choice-card]"));
  const peopleField = document.getElementById("persoane-field");
  const peopleSelect = document.getElementById("persoane");
  const submitButton = document.getElementById("submit-button");
  const formStatus = document.getElementById("form-status");
  const defaultButtonText = submitButton.textContent;
  const isLocalPreview =
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const getPresence = () => {
    const selected = presenceInputs.find((input) => input.checked);
    return selected ? selected.value : "";
  };

  const syncChoiceCards = () => {
    choiceCards.forEach((card) => {
      const input = card.querySelector('input[name="prezenta"]');
      card.classList.toggle("is-selected", Boolean(input && input.checked));
    });
  };

  const togglePeopleField = () => {
    const shouldShow = getPresence() === "Da";
    peopleField.hidden = !shouldShow;
    peopleSelect.required = shouldShow;

    if (!shouldShow) {
      peopleSelect.value = "";
    }
  };

  const encodeFormData = (formData) => {
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      params.append(key, value);
    }

    return params.toString();
  };

  const savePreviewSubmission = (formData) => {
    const payload = {
      nume: formData.get("nume") || "",
      telefon: formData.get("telefon") || "",
      prezenta: formData.get("prezenta") || "",
      persoane: formData.get("persoane") || "",
      mesaj: formData.get("mesaj") || "",
      savedAt: new Date().toISOString()
    };

    try {
      const previous = JSON.parse(window.localStorage.getItem("boho-chic-rsvp-preview") || "[]");
      previous.push(payload);
      window.localStorage.setItem("boho-chic-rsvp-preview", JSON.stringify(previous));
    } catch (error) {
      // Ignore preview storage issues and continue.
    }
  };

  const redirectByPresence = (presence) => {
    window.location.href = presence === "Nu" ? "nu.html" : "multumim.html";
  };

  presenceInputs.forEach((input) => {
    input.addEventListener("change", () => {
      syncChoiceCards();
      togglePeopleField();
      formStatus.textContent = "";
    });
  });

  syncChoiceCards();
  togglePeopleField();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const presence = formData.get("prezenta");

    if (!presence) {
      formStatus.textContent = "Te rugam sa alegi daca vei participa.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Se trimite...";
    formStatus.textContent = "Trimitem confirmarea ta.";

    if (isLocalPreview) {
      savePreviewSubmission(formData);
      redirectByPresence(presence);
      return;
    }

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: encodeFormData(formData)
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      redirectByPresence(presence);
    } catch (error) {
      submitButton.disabled = false;
      submitButton.textContent = defaultButtonText;
      formStatus.textContent = "A aparut o problema la trimitere. Te rugam sa incerci din nou.";
    }
  });
}
