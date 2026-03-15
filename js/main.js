/* ============================================================
   main.js — UI Logic & Event Handlers for Zest & Zyme
   Depends on: api.js (must be loaded before this file)
   
   Sections:
     1. State
     2. Theme Toggle (Water Fill Animation)
     3. UI Helpers (showError, showLoader, hideLoader)
     4. Navigation (backToList)
     5. Render Functions (renderList, showFullRecipe)
     6. Search Handler (fetchRecipe — orchestrates API + UI)
     7. Event Listeners
   ============================================================ */


/* ============================================================
   1. STATE
   Holds app-level data shared across functions
   ============================================================ */

/** @type {Array} Stores the current search result meals */
let currentMeals = [];


/* ============================================================
   2. THEME TOGGLE — Water Fill Animation
   Animates a liquid fill inside the theme button,
   then swaps dark/light mode and saves preference.
   ============================================================ */

const themeBtn = document.getElementById('theme-btn');
const waterLevel = document.getElementById('water-level');
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');
const html = document.documentElement;

// Sync icon state to current theme on page load
if (html.classList.contains('dark')) {
    iconMoon.classList.add('hidden');
    iconSun.classList.remove('hidden');
}

/**
 * Handles the theme toggle button click.
 *
 * Direction-aware animation:
 *   - Light → Dark (going to night): water FILLS UP from bottom  🌙
 *   - Dark  → Light (going to day) : water DRAINS DOWN from top  ☀️
 *
 * This makes the animation semantically match the transition:
 * filling feels like "going deeper into night",
 * draining feels like "emptying out into daylight".
 */
themeBtn.addEventListener('click', () => {
    if (themeBtn.disabled) return; // Prevent double-click during animation
    themeBtn.disabled = true;

    const isDark = html.classList.contains('dark');

    if (!isDark) {
        /* ── LIGHT → DARK: Fill UP from bottom (water rises into night) ── */
        // Start hidden below the button, color is dark slate for night
        waterLevel.className = 'absolute bottom-0 left-0 w-full h-full transform translate-y-full z-0 rounded-full bg-brand-slate';
        waterLevel.style.transition = 'transform 600ms ease-in-out';
        waterLevel.style.opacity = '1';

        // Force reflow so the start position registers before animating
        void waterLevel.offsetWidth;

        // Animate fill: slide UP to cover the button entirely
        waterLevel.style.transform = 'translateY(0%)';

        setTimeout(() => {
            // Switch to dark mode once the button is covered
            html.classList.add('dark');
            localStorage.theme = 'dark';
            iconMoon.classList.add('hidden');
            iconSun.classList.remove('hidden');

            // Fade out the water overlay to reveal the newly dark button
            setTimeout(() => {
                waterLevel.style.transition = 'opacity 0.4s ease';
                waterLevel.style.opacity = '0';

                setTimeout(() => {
                    // Reset to hidden-below state ready for next click
                    waterLevel.style.transition = '';
                    waterLevel.style.transform = 'translateY(100%)';
                    waterLevel.style.opacity = '1';
                    themeBtn.disabled = false;
                }, 400);
            }, 100);
        }, 600);

    } else {
        /* ── DARK → LIGHT: Drain DOWN from top (water falls away into day) ── */
        // Start fully covering the button (filled), color is yellow for daylight
        waterLevel.className = 'absolute bottom-0 left-0 w-full h-full z-0 rounded-full bg-yellow-400';
        waterLevel.style.transition = 'none';
        waterLevel.style.opacity = '1';
        waterLevel.style.transform = 'translateY(0%)';   // start: fully filled

        // Force reflow so starting state registers before we animate drain
        void waterLevel.offsetWidth;

        // Animate drain: slide DOWN so water drops out of the button
        waterLevel.style.transition = 'transform 600ms ease-in-out';
        waterLevel.style.transform = 'translateY(100%)'; // end: fully drained

        setTimeout(() => {
            // Switch to light mode now that the button has "emptied"
            html.classList.remove('dark');
            localStorage.theme = 'light';
            iconSun.classList.add('hidden');
            iconMoon.classList.remove('hidden');

            // Fully reset element state
            waterLevel.style.transition = '';
            waterLevel.style.opacity = '1';
            themeBtn.disabled = false;
        }, 600);
    }
});


/* ============================================================
   3. UI HELPERS
   Small utility functions used across the app
   ============================================================ */

/**
 * Displays an error message below the search bar for 5 seconds.
 * @param {string} message - The error text to show
 */
function showError(message) {
    const errorContainer = document.getElementById('error-message');
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
    setTimeout(() => { errorContainer.classList.add('hidden'); }, 5000);
}

/**
 * Shows the loading spinner and hides the search button text.
 */
function showLoader() {
    const loader = document.getElementById('loader');
    const btnText = document.getElementById('btn-text');
    loader.style.display = 'block';
    btnText.style.display = 'none';
}

/**
 * Hides the loading spinner and restores the search button text.
 */
function hideLoader() {
    const loader = document.getElementById('loader');
    const btnText = document.getElementById('btn-text');
    loader.style.display = 'none';
    btnText.style.display = 'block';
}


/* ============================================================
   4. NAVIGATION
   Controls back button visibility and view switching
   ============================================================ */

/**
 * Navigates back from the recipe detail view to the results list.
 * Hides back button, shows recipe list, scrolls to top.
 */
function backToList() {
    const backBtnWrapper = document.getElementById('back-btn-wrapper');
    backBtnWrapper.classList.add('hidden');
    backBtnWrapper.classList.remove('flex');

    document.getElementById('recipe-detail-container').classList.add('hidden');
    document.getElementById('recipe-list-container').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ============================================================
   5. RENDER FUNCTIONS
   Build and inject HTML into the DOM
   ============================================================ */

/**
 * Renders the recipe result grid (cards) from `currentMeals`.
 * Each card animates in with a staggered delay.
 *
 * @param {string} query - The search term displayed in the result heading
 */
function renderList(query) {
    const listContainer = document.getElementById('recipe-list-container');
    listContainer.innerHTML = '';

    // Result heading with count
    const titleHTML = `
        <div class="col-span-1 md:col-span-2 lg:col-span-3 mb-1 md:mb-2 fade-in-up px-1">
            <h2 class="font-display text-2xl font-bold text-brand-slate dark:text-white transition-colors">Top results for <span class="text-brand-leaf dark:text-brand-sage">"${query}"</span></h2>
            <p class="text-brand-sage dark:text-brand-cream/70 text-sm mt-1 font-medium transition-colors">Found ${currentMeals.length} delicious options.</p>
        </div>
    `;
    listContainer.innerHTML += titleHTML;

    // Generate a card for each meal with staggered animation delay
    currentMeals.forEach((meal, index) => {
        const delay = index * 100;
        const cardHTML = `
            <div onclick="showFullRecipe('${meal.idMeal}')" class="group cursor-pointer bg-white dark:bg-brand-darkCard rounded-3xl md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-brand-sage/10 dark:border-white/10 hover:border-brand-sage/30 dark:hover:border-white/30 fade-in-up w-full" style="animation-delay: ${delay}ms;">
                <div class="h-52 md:h-56 overflow-hidden relative w-full">
                    <img src="${meal.strMealThumb}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <span class="absolute bottom-4 left-4 text-white font-bold tracking-widest text-[10px] uppercase bg-brand-terracotta px-3 py-1.5 rounded-full shadow-lg">${meal.strCategory}</span>
                </div>
                <div class="p-5 md:p-6">
                    <h3 class="font-display font-bold text-lg md:text-xl text-brand-slate dark:text-white group-hover:text-brand-leaf dark:group-hover:text-brand-sage transition-colors line-clamp-1">${meal.strMeal}</h3>
                    <p class="text-xs md:text-sm text-brand-sage dark:text-brand-cream/70 mt-2 md:mt-3 font-semibold flex items-center gap-2 transition-colors">
                        View Full Recipe 
                        <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </p>
                </div>
            </div>
        `;
        listContainer.innerHTML += cardHTML;
    });

    listContainer.classList.remove('hidden');
}

/**
 * Builds the ingredient grid HTML for a given meal object.
 * Iterates over the 20 possible ingredient/measure pairs in the API response.
 *
 * @param {Object} meal - A meal object from TheMealDB API
 * @returns {string} - HTML string of ingredient cards
 */
function buildIngredientsHTML(meal) {
    let ingredientsHTML = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            ingredientsHTML += `
                <div class="flex flex-col p-3.5 bg-brand-sage/5 dark:bg-white/5 border border-brand-sage/10 dark:border-white/5 rounded-2xl transition-all hover:bg-brand-sage/10 dark:hover:bg-white/10">
                    <span class="font-display font-bold text-brand-terracotta dark:text-brand-terracotta text-base md:text-lg tracking-tight">${measure}</span>
                    <span class="text-sm text-brand-slate/80 dark:text-brand-cream/80 font-semibold mt-1 leading-tight">${ingredient}</span>
                </div>`;
        }
    }
    return ingredientsHTML;
}

/**
 * Shows the full recipe detail view for a specific meal.
 * Hides the list, shows the detail container and back button.
 *
 * @param {string} idMeal - The unique meal ID from TheMealDB
 */
function showFullRecipe(idMeal) {
    const meal = currentMeals.find(m => m.idMeal === idMeal);
    if (!meal) return;

    // Show back button
    const backBtnWrapper = document.getElementById('back-btn-wrapper');
    backBtnWrapper.classList.remove('hidden');
    backBtnWrapper.classList.add('flex');

    // Hide list, prepare detail container
    document.getElementById('recipe-list-container').classList.add('hidden');
    const detailContainer = document.getElementById('recipe-detail-container');
    const contentDiv = document.getElementById('full-recipe-content');

    const ingredientsHTML = buildIngredientsHTML(meal);

    // Inject full recipe HTML into the detail container
    contentDiv.innerHTML = `
        <article class="fade-in-up bg-white dark:bg-brand-darkCard rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-xl md:shadow-2xl border border-brand-sage/10 dark:border-white/5 w-full transition-colors duration-500">
            
            <!-- Hero Image with Overlay -->
            <div class="relative h-64 md:h-[28rem] w-full">
                <img src="${meal.strMealThumb}" class="w-full h-full object-cover" alt="${meal.strMeal}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div class="absolute bottom-5 md:bottom-10 left-5 md:left-10 right-5 md:right-10">
                    <span class="inline-block px-3 py-1 bg-brand-terracotta text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 md:mb-3 shadow-md">${meal.strCategory} | ${meal.strArea}</span>
                    <h2 class="font-display text-3xl md:text-6xl text-white font-extrabold leading-tight drop-shadow-lg">${meal.strMeal}</h2>
                </div>
            </div>

            <!-- Meta Bar: Type, Difficulty, YouTube -->
            <div class="grid grid-cols-2 md:grid-cols-3 border-b border-brand-sage/5 dark:border-white/5 bg-brand-cream/50 dark:bg-black/20 text-center py-4 md:py-5 transition-colors duration-500">
                <div class="border-r border-brand-sage/10 dark:border-white/10 flex flex-col justify-center">
                    <span class="block text-[10px] uppercase font-bold text-brand-sage dark:text-brand-cream/50 tracking-wider mb-1 transition-colors">Type</span>
                    <span class="font-bold text-brand-slate dark:text-white text-sm md:text-base transition-colors">Main Dish</span>
                </div>
                <div class="md:border-r border-brand-sage/10 dark:border-white/10 flex flex-col justify-center">
                    <span class="block text-[10px] uppercase font-bold text-brand-sage dark:text-brand-cream/50 tracking-wider mb-1 transition-colors">Difficulty</span>
                    <span class="font-bold text-brand-slate dark:text-white text-sm md:text-base transition-colors">Medium</span>
                </div>
                <div class="col-span-2 md:col-span-1 mt-4 md:mt-0 border-t border-brand-sage/10 dark:border-white/10 md:border-none pt-4 md:pt-0 flex flex-col items-center justify-center">
                    <span class="block text-[10px] uppercase font-bold text-brand-sage dark:text-brand-cream/50 tracking-wider mb-2 transition-colors">Source</span>
                    <a href="${meal.strYoutube}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2 bg-brand-terracotta hover:bg-brand-slate dark:hover:bg-brand-sage text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm md:text-base">
                        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                        Watch Video
                    </a>
                </div>
            </div>

            <!-- Ingredients & Instructions -->
            <div class="p-5 md:p-12">
                <div class="flex flex-col lg:flex-row gap-8 md:gap-12">
                    
                    <!-- Ingredients Grid -->
                    <div class="lg:w-1/3">
                        <h3 class="font-display text-xl md:text-2xl font-bold text-brand-leaf dark:text-brand-sage mb-5 flex items-center gap-3 transition-colors">
                            <span class="w-1.5 h-6 bg-brand-terracotta rounded-full"></span> Ingredients
                        </h3>
                        <div class="grid grid-cols-2 gap-3">
                            ${ingredientsHTML}
                        </div>
                    </div>

                    <!-- Instructions Text -->
                    <div class="lg:w-2/3">
                        <h3 class="font-display text-xl md:text-2xl font-bold text-brand-leaf dark:text-brand-sage mb-5 flex items-center gap-3 transition-colors">
                            <span class="w-1.5 h-6 bg-brand-sage rounded-full"></span> Instructions
                        </h3>
                        <p class="text-brand-slate/80 dark:text-brand-cream/80 leading-relaxed whitespace-pre-line font-medium text-sm md:text-lg transition-colors">
                            ${meal.strInstructions}
                        </p>
                    </div>

                </div>
            </div>
        </article>
    `;

    detailContainer.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ============================================================
   6. SEARCH HANDLER
   Orchestrates the search: validates input → calls API →
   updates UI state → renders results or shows error
   ============================================================ */

/**
 * Main search handler triggered by the Search button or Enter key.
 * Validates input, calls the API module, and updates the page.
 */
async function fetchRecipe() {
    const rawQuery = document.getElementById('search-input').value.trim();

    // Validate: don't allow empty queries
    if (!rawQuery) {
        showError('Please enter a recipe name to search.');
        return;
    }

    const headerSection = document.getElementById('header-section');
    const logoContainer = document.getElementById('logo-container');
    const detailContainer = document.getElementById('recipe-detail-container');
    const backBtnWrapper = document.getElementById('back-btn-wrapper');

    // Show loading state
    showLoader();
    document.getElementById('error-message').classList.add('hidden');

    // Ensure back button is hidden while fetching new results
    backBtnWrapper.classList.add('hidden');
    backBtnWrapper.classList.remove('flex');

    try {
        // Delegate to the API module (js/api.js)
        const meals = await fetchRecipeByName(rawQuery);

        if (meals.length > 0) {
            currentMeals = meals;

            // Transition header from hero state → sticky bar
            headerSection.classList.remove('state-initial');
            headerSection.classList.add('state-active');
            logoContainer.classList.add('hidden');
            detailContainer.classList.add('hidden');

            // Brief delay so CSS transition can start before DOM update
            setTimeout(() => {
                renderList(rawQuery);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);

        } else {
            // No results — show a helpful suggestion message
            showError(`No recipe found for "${rawQuery}". Try 'Pancakes' or 'Chicken'.`);
        }

    } catch (error) {
        // Network error or unexpected API failure
        console.error('API Error:', error);
        showError(`System Error: ${error.message}`);
    } finally {
        // Always restore button to ready state
        hideLoader();
    }
}


/* ============================================================
   7. EVENT LISTENERS
   Binds keyboard and click events to search functionality
   ============================================================ */

/**
 * Allow pressing Enter in the search input to trigger search.
 */
document.getElementById('search-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        fetchRecipe();
    }
});
