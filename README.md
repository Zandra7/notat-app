# Notat-app

Dette er en applikasjon for å skrive og holde orden på notater.

Du kan eksportere og importere notater med JSON, og filtrere etter notater med tags.

På hvert notat kan du se:

- Tittel
- Opprettelses tid
- Sist endret
- Innhold
- Tags

Appen fungerer uten internett.

## Installasjonsveiledning

**1. Klon Repositoriet:** Start med å klone repositoriet til din lokale maskin.

**2. Installer Avhengigheter:** Naviger til prosjektmappen i terminalen og kjør linjene under for å installere avhengigheter.

    npm install

---

    npm install express

---

    npm install sqlite3

**3. Start Serveren:** Kjør kommandoen under for å starte serveren. Serveren vil kjøre på port 3000, slik at du kan få tilgang til appen via `http://localhost:3000` i nettleseren.

    node index.js
