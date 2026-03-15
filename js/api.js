/* ============================================================
   api.js — API Layer for Zest & Zyme
   Handles all communication with TheMealDB external API.
   Exports: fetchRecipeByName(query) → Promise<meal[]>
   ============================================================ */

/**
 * Base URL for TheMealDB public API (v1 free tier).
 * Docs: https://www.themealdb.com/api.php
 */
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Searches for meals by name using TheMealDB search endpoint.
 *
 * @param {string} query - The recipe/meal name to search for (e.g. "chicken")
 * @returns {Promise<Array>} - Resolves with array of meal objects (max 6), or empty array if none found
 * @throws {Error} - Throws if the network request fails or server returns non-OK status
 *
 * @example
 * const meals = await fetchRecipeByName('pancakes');
 * // meals → [{ idMeal, strMeal, strMealThumb, strIngredient1, ... }, ...]
 */
async function fetchRecipeByName(query) {
    const encodedQuery = encodeURIComponent(query);
    const url = `${API_BASE_URL}/search.php?s=${encodedQuery}`;

    // Make the HTTP GET request to TheMealDB
    const response = await fetch(url);

    // Throw if the server returns an error status (4xx / 5xx)
    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // API returns { meals: [...] } or { meals: null } when nothing found
    if (!data.meals || data.meals.length === 0) {
        return []; // No results found — let the caller handle this case
    }

    // Limit results to top 6 to keep the UI clean
    return data.meals.slice(0, 6);
}
