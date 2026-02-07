import type { RecipeCard } from './recipe-book-data';

export function createRecipeBookMarkup(recipes: RecipeCard[]) {
  return `
    <div aria-label="Recipe book overview" aria-modal="true" class="recipe-book-panel" role="dialog">
      <div class="recipe-book-content">
        <div class="recipe-book-close-wrapper">
          <button
            aria-label="Close book"
            class="recipe-book-close"
            data-recipe-book-close
            type="button"
          >
            <svg aria-hidden="true" class="recipe-book-icon" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>
        <div class="recipe-book-nav">
          <button
            aria-label="Previous page"
            class="recipe-book-arrow"
            data-recipe-book-prev
            type="button"
          >
            <svg aria-hidden="true" class="recipe-book-icon" viewBox="0 0 24 24">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div class="recipe-book-pages" data-recipe-book-pages>
            <article class="recipe-page recipe-page-cover is-active" data-recipe-page="0">
              <div class="recipe-page-inner recipe-cover-inner">
                <div class="recipe-cover-frame">
                  <div>
                    <div class="recipe-cover-title">
                      <strong>Recipes</strong>
                    </div>
                    <div class="recipe-cover-subtitle">Bake 'n Shake</div>
                  </div>
                  <img alt="Croissant" class="recipe-cover-icon" src="/recipes/croissant.png" />
                  <div class="recipe-cover-authors">
                    <span>Alex Strutz</span>
                    <span>Christin Zieba</span>
                    <span>Lukas Hülsthorst</span>
                    <span>Mona Uppenkamp</span>
                  </div>
                </div>
              </div>
            </article>
            ${recipes
              .map(
                (recipe, index) => `
                <article class="recipe-page" data-recipe-page="${index + 1}">
                  <div class="recipe-page-inner">
                    <img class="recipe-page-image" src="${recipe.image}" alt="${recipe.imageAlt}" />
                    <div class="recipe-page-header">
                      <div>
                        <h3>${recipe.title}</h3>
                        <p>${recipe.blurb}</p>
                      </div>
                      <div class="recipe-book-badge">${recipe.badge}</div>
                    </div>
                    <div class="recipe-page-meta">
                      <span>${recipe.time}</span>
                      <span>${recipe.difficulty}</span>
                    </div>
                    <div class="recipe-page-body">
                      <div class="recipe-page-section">
                        <h4>Zutaten</h4>
                        <ul>
                          ${recipe.ingredients.map((item) => `<li>${item}</li>`).join('')}
                        </ul>
                      </div>
                      <div class="recipe-page-section">
                        <h4>Schritte</h4>
                        <ol>
                          ${recipe.steps.map((step) => `<li>${step}</li>`).join('')}
                        </ol>
                      </div>
                    </div>
                  </div>
                </article>
              `,
              )
              .join('')}
            <article class="recipe-page recipe-page-back" data-recipe-page="${recipes.length + 1}">
              <div class="recipe-page-inner recipe-cover-inner">
                <div class="recipe-cover-frame">
                  <div>
                    <div class="recipe-cover-title">
                      <strong>Thanks</strong>
                    </div>
                    <div class="recipe-cover-subtitle">See you in the kitchen</div>
                  </div>
                  <div class="recipe-back-blurb">
                    <p>Stamped by the Bake 'n Shake Mausis.</p>
                    <p>Handle with flour-dusted hands only.</p>
                  </div>
                  <div class="recipe-cover-authors">
                    <span>Crafted with butter</span>
                    <span>and a lot of chaos</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
          <button
            aria-label="Next page"
            class="recipe-book-arrow"
            data-recipe-book-next
            type="button"
          >
            <svg aria-hidden="true" class="recipe-book-icon" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}
