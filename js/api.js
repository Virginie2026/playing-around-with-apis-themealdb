const MEALDB_URL =  "https://www.themealdb.com/api/json/v1/1";


async function fetchJSON(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Server error: " + response.status);
    }

    return response.json();
}

async function searchMeals(name) {
    const data = await fetchJSON(MEALDB_URL + "/search.php?s=" + encodeURIComponent(name));
    return data.meals || [];
}

async function getCategories() {
    const data = await fetchJSON(MEALDB_URL + "/list.php?c=list");
    return data.meals || [];
}

async function getAreas() {
    const data  = await fetchJSON(MEALDB_URL + "/list.php?a=list");
    return data.meals || [];
}

async function filterMeals(type,value) {
    const param = type === "category" ? "c" : "a";
    const data = await fetchJSON(MEALDB_URL + "/filter.php?" + param + "=" + encodeURIComponent(value));
    return data.meals || [];
}

async function getMealById(id) {
    const data = await fetchJSON(MEALDB_URL + "/lookup.php?i=" + id);
    return data.meals ? data.meals[0] : null;
}

const REGIONS = {
    Africa: ["Algerian", "Egyptian", "Kenyan", "Moroccan", "Tunisian"],
    Asia: ["Chinese", "Indian", "Japanese", "Filipino", "Malaysian", "Thai", "Vietnamese", "Turkish", "Saudi Arabian", "Syrian"],
    Europe: ["British", "French", "Italian", "Spanish", "Greek", "Portuguese", "Dutch", "Polish", "Irish", "Croatian"],
    Americas: ["American", "Canadian", "Mexican", "Jamaican", "Argentinian", "Uruguayan", "Venezulan"]
};



async function getCountryInfo(area) {
    try {
        const data = await fetchJSON("data/countries.json");
        return data[area] || null;
} catch (error) {
    console.error("Country info unavailable:", error);
    return null;
 }

}
    