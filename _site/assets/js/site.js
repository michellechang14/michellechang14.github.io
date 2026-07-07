const filterButtons = document.querySelectorAll("[data-filter]");
const publicationCards = document.querySelectorAll(".publication-card[data-year]");
const languageToggle = document.querySelector("[data-language-toggle]");

const applyLanguage = (language) => {
  const normalizedLanguage = language === "zh" ? "zh" : "en";
  document.documentElement.lang = normalizedLanguage;
  if (languageToggle) {
    languageToggle.textContent = normalizedLanguage === "zh" ? "EN" : "中文";
    languageToggle.setAttribute(
      "aria-label",
      normalizedLanguage === "zh" ? "Switch to English" : "切换到中文"
    );
  }
};

const savedLanguage = localStorage.getItem("siteLanguage") || "en";
applyLanguage(savedLanguage);

if (languageToggle) {
  languageToggle.addEventListener("click", () => {
    const nextLanguage = document.documentElement.lang === "zh" ? "en" : "zh";
    localStorage.setItem("siteLanguage", nextLanguage);
    applyLanguage(nextLanguage);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    publicationCards.forEach((card) => {
      card.classList.toggle("hidden", filter !== "all" && card.dataset.year !== filter);
    });
  });
});
