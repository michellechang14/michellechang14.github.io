const filterButtons = document.querySelectorAll("[data-filter]");
const publicationCards = document.querySelectorAll(".publication-card[data-year]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    publicationCards.forEach((card) => {
      card.classList.toggle("hidden", filter !== "all" && card.dataset.year !== filter);
    });
  });
});
