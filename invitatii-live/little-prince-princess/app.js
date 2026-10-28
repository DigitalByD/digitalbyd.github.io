const rsvpForm = document.getElementById("rsvp-form");
const formStatus = document.getElementById("form-status");

if (rsvpForm && formStatus) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    formStatus.textContent =
      "Multumim! Confirmarea a fost inregistrata. Abia asteptam sa sarbatorim impreuna.";
    formStatus.classList.add("is-success");

    rsvpForm.reset();
  });
}
