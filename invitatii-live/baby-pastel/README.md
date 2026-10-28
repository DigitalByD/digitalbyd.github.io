# Baby Pastel

Site static pentru invitatia de botez Baby Pastel.

## Deploy pe GitHub Pages

1. Pune toate fisierele din acest folder in repository.
2. In GitHub, mergi la Settings > Pages.
3. La Source, alege GitHub Actions.
4. Fa push pe branch-ul `main` sau `master`.

Workflow-ul din `.github/workflows/pages.yml` publica site-ul fara build, npm sau dependinte externe.

## Fisiere principale

- `index.html` - invitatia
- `styles.css` - designul
- `app.js` - formularul RSVP si redirecturile
- `multumim.html` - raspuns pentru participare
- `nu.html` - raspuns pentru neparticipare
