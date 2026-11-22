const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const categorySelect = document.getElementById("category-select");
const areaSelect = document.getElementById("area-select");
const sortSelect = document.getElementById("sort-select");
const favoritesBtn = document.getElementById("favorites-btn");
const closeModalBtn = document.getElementById("close-modal");

let currentMeals = [];

function showMeals(meals) {
    currentMeals = meals;
    renderMeals(sortMeals(meals, sortSelect.value));
}

async function runRequest(request) {
    showStatus("Loading...", false);
    resultsEl.innerHTML = "";
    try {
        const meals = await request();
        showMeals(meals);
 } catch (error) {
    showStatus("Unable to reach TheMealDB. Please check your connection and try again.", true);
 }

}

async function loadCategories() {
    try {
        const categories = await getCategories();
        categories.forEach(function (item) {
            const option = document.createElement("option");
            option.value = item.strCategory;
            option.textContent =  item.strCategory;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        showStatus("Could not load categories.", true);
 }

}

function loadAreas() {
    Object.keys(REGIONS).forEach(function (continent) {
        const group = document.createElement("optgroup");
        group.label = continent;
        REGIONS[continent].forEach(function (area) {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            group.appendChild(option);
        });
        areaSelect.appendChild(group);
    });

}
 
  searchBtn.addEventListener("click", function () {
    const name = searchInput.value.trim();
    if (!name) {
        showStatus("Type a meal name first.", true);
        return;
    }
    runRequest(function () { return searchMeals(name); });
  
});

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") searchBtn.click();
 });

 categorySelect.addEventListener("change", function () {
    if (!categorySelect.value) return;
    areaSelect.value = "";
    runRequest(function () { return filterMeals("category", categorySelect.value); });

 });
  
 areaSelect.addEventListener("change", function () {
    if  (!areaSelect.value) return;
    categorySelect.value = "";
    runRequest(function () { return filterMeals("area", areaSelect.value); });
 });

 sortSelect.addEventListener("change", function () {
    showMeals(currentMeals);
});

favoritesBtn.addEventListener("click", function () {
    if (favorites.length === 0) {
        resultsEl.innerHTML= "";
        showStatus("No favorites yet. Click Save on a recipe.", false);
        return;
    }
    showMeals(favorites);
});

closeModalBtn.addEventListener("click", closeModal);
 modalEl.addEventListener("click", function (event) {
    if (event.target === modalEl) closeModal();
});

loadCategories();
loadAreas();
runRequest(function () { return searchMeals("chicken"); });