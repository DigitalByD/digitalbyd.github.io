const rsvpForm = document.getElementById("rsvp-form");
const formStatus = document.getElementById("form-status");

if (rsvpForm && formStatus) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    formStatus.textContent =
      "Multumim! Raspunsul tau a fost inregistrat. Revenim cu toate detaliile pentru aceasta calatorie frumoasa.";
    formStatus.classList.add("is-success");

    rsvpForm.reset();
  });
}
