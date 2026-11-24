const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status-message");
const modalEl = document.getElementById("modal");
const modalBodyEl = document.getElementById("modal-body");

let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(id) {
    return favorites.some(function (meal) { return meal.idMeal === id; });
}

function toggleFavorite(meal, btn) {
    if (isFavorite(meal.idMeal)) {
        favorites = favorites.filter(function (m) { return m.idMeal !== meal.idMeal; });
        btn.classList.remove("saved");
        btn.textContent = "Save";
    } else {
        favorites.push(meal);
        btn.classList.add("saved");
        btn.textContent = "Saved";
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
}
function showStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle("error", Boolean(isError));
}

function sortMeals(meals, order) {
    const sorted = meals.slice();
    sorted.sort(function (a,b) { return a.strMeal.localeCompare(b.strMeal); });
    if (order === "za") sorted.reverse();
    return sorted;
}

function renderMeals(meals) {
    resultsEl.innerHTML = "";
   
    if (meals.length === 0) {
        showStatus("No recipes found. Try another search.", false);
        return;
    }

    showStatus(meals.length + " recipe(s) found", false);

    meals.forEach(function (meal) {
        const card = document.createElement("article");
        card.className = "card"; 

        const  saved = isFavorite(meal.idMeal);
        card.innerHTML =
            '<button class="fav-btn' + (saved ? " saved" : "") + '" aria-label="Toggle favorites">' + (saved ? "Saved" : "Save")  + "</button>" +
            '<img src="' + meal.strMealThumb + '" alt="' + meal.strMeal + '">' +
            '<div class="card-info"><h3>' + meal.strMeal + "</h3>" +
            (meal.strArea ? '<span class="tag">' + meal.strArea + "</span>" : "") +
            "</div>";

            card.querySelector(".fav-btn").addEventListener("click", function (event) {
                event.stopPropagation();
                toggleFavorite(meal, event.currentTarget);
            });

            card.addEventListener("click", function () { openModal(meal.idMeal); });
            resultsEl.appendChild(card);
        });

   }


async function openModal(id) {
    modalEl.classList.remove("hidden");
    modalBodyEl.textContent = "Loading...";

    try {
        const meal = await getMealById(id);
        if (!meal) {
            modalBodyEl.textContent = "Recipe not found.";
            return;
        }

        const country = await getCountryInfo(meal.strArea);
        const countryHtml = country
        ?'<p><img src="https://flagcdn.com/w40/' + country.flag + '.png" alt=""> ' +
        "<strong>" + country.country + "</strong> . Capital: " + country.capital +
        ". Language: " + country.language + ". Currency: " + country.currency + "</p>"
        : "<p>Country info unavailable for this recipe.</p>";

        let ingredients = "";
        for (let i = 1 ; i <= 20; i++) {
            const name = meal["strIngredient" + i];
            if (name && name.trim()) {
                ingredients += "<li>" + meal["strMeasure" + i] + " " + name + "</li>";
            }
        }
        modalBodyEl.innerHTML =
        "<h2>" + meal.strMeal + "</h2>" +
        '<img src="' + meal.strMealThumb + '" alt="' + meal.strMeal + '">' +
        countryHtml +
        "<h3>Ingredients</h3><ul>" + ingredients + "</ul>" +
        "<h3>Instructions</h3><p>" + meal.strInstructions + "</p>";
    } catch (error) {
        modalBodyEl.textContent= "Unable to load this recipe. Please try again.";
     }
}

function closeModal() {
    modalEl.classList.add("hidden");
}


