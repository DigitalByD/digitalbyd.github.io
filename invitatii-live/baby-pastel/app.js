const form = document.getElementById("rsvp-form");

if (form) {
  const presenceInputs = Array.from(form.querySelectorAll('input[name="prezenta"]'));
  const choiceCards = Array.from(form.querySelectorAll("[data-choice-card]"));
  const peopleField = document.getElementById("persoane-field");
  const peopleSelect = document.getElementById("persoane");
  const submitButton = document.getElementById("submit-button");
  const formStatus = document.getElementById("form-status");

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
      const previous = JSON.parse(window.localStorage.getItem("baby-pastel-rsvp") || "[]");
      previous.push(payload);
      window.localStorage.setItem("baby-pastel-rsvp", JSON.stringify(previous));
    } catch (error) {
      // Continue even when local storage is unavailable.
    }
  };

  const redirectByPresence = (presence) => {
    window.location.href = presence === "Nu" ? "./nu.html" : "./multumim.html";
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

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const presence = formData.get("prezenta");

    if (!presence) {
      formStatus.textContent = "Te rugam sa alegi daca vei participa.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Se trimite...";
    formStatus.textContent = "Am salvat raspunsul.";

    savePreviewSubmission(formData);
    window.setTimeout(() => redirectByPresence(presence), 350);
  });
}
