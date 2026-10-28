const rsvpForm = document.getElementById("rsvp-form");
const formStatus = document.getElementById("form-status");
const countdownSection = document.querySelector("[data-event-date]");
const countdownNote = document.getElementById("countdown-note");

if (countdownSection) {
  const eventDateValue = countdownSection.getAttribute("data-event-date");
  const eventDate = eventDateValue ? new Date(eventDateValue) : null;
  const countdownFields = {
    days: countdownSection.querySelector('[data-countdown="days"]'),
    hours: countdownSection.querySelector('[data-countdown="hours"]'),
    minutes: countdownSection.querySelector('[data-countdown="minutes"]'),
    seconds: countdownSection.querySelector('[data-countdown="seconds"]')
  };

  const formatValue = (value, minimumDigits = 2) =>
    String(Math.max(value, 0)).padStart(minimumDigits, "0");

  const updateCountdown = () => {
    if (!eventDate || Number.isNaN(eventDate.getTime())) {
      return;
    }

    const difference = eventDate.getTime() - Date.now();

    if (difference <= 0) {
      countdownFields.days.textContent = "000";
      countdownFields.hours.textContent = "00";
      countdownFields.minutes.textContent = "00";
      countdownFields.seconds.textContent = "00";

      if (countdownNote) {
        countdownNote.textContent = "Ziua evenimentului a sosit. Ne vedem foarte curand.";
      }

      return;
    }

    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownFields.days.textContent = formatValue(days, 3);
    countdownFields.hours.textContent = formatValue(hours);
    countdownFields.minutes.textContent = formatValue(minutes);
    countdownFields.seconds.textContent = formatValue(seconds);

    if (countdownNote) {
      countdownNote.textContent = "Ne apropiem de una dintre cele mai frumoase seri din viata noastra.";
    }
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

if (rsvpForm && formStatus) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    formStatus.textContent =
      "Multumim! Confirmarea a fost inregistrata. Abia asteptam sa sarbatorim impreuna.";
    formStatus.classList.add("is-success");

    rsvpForm.reset();
  });
}
