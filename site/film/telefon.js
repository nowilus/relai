// The install card on a phone. RelAI cannot be installed from a phone, so the card offers what a
// phone can do: send the page's link to yourself (the system share sheet, or the clipboard when
// there is none) and copy the default commands for later. The full configurator stays on wider screens.

/** The page's address pointing at the install section, without any other fragment. */
export function adresInstalacji(href, id) {
  const url = new URL(href);
  url.hash = id;
  return url.toString();
}

/** A cancelled share sheet is the user's choice, not an error. */
export const czyAnulowane = (e) => e instanceof Error && e.name === "AbortError";

async function kopiuj(win, tekst, status, ok, blad) {
  try {
    await win.navigator.clipboard.writeText(tekst);
    status.textContent = ok;
  } catch {
    status.textContent = blad;
  }
}

export function zamontujTelefon(doc = document, win = window) {
  const karta = doc.querySelector("[data-telefon]");
  if (!karta) return;
  const d = karta.dataset;
  const status = karta.querySelector("[data-status-telefonu]");
  const komendy = karta.querySelector("[data-komendy-telefonu]");
  const wyslij = karta.querySelector("[data-wyslij]");
  const kopiujKomendy = karta.querySelector("[data-kopiuj-komendy]");
  const sekcja = karta.closest("section");
  const adres = adresInstalacji(win.location.href, sekcja?.id ?? "");

  wyslij.addEventListener("click", async () => {
    status.textContent = "";
    if (typeof win.navigator.share !== "function") {
      await kopiuj(win, adres, status, d.linkSkopiowany, d.blad);
      return;
    }
    try {
      await win.navigator.share({ title: d.tytul, url: adres });
    } catch (e) {
      if (!czyAnulowane(e)) await kopiuj(win, adres, status, d.linkSkopiowany, d.blad);
    }
  });
  kopiujKomendy.addEventListener("click", () => kopiuj(win, komendy.textContent, status, d.skopiowano, d.blad));

  // With JavaScript the buttons replace the printed commands; without it the commands stay readable.
  wyslij.removeAttribute("hidden");
  kopiujKomendy.removeAttribute("hidden");
  komendy.setAttribute("hidden", "");
}
