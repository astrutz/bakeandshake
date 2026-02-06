import './recipe-book.css';

type RecipeCard = {
  title: string;
  time: string;
  difficulty: string;
  blurb: string;
  badge: string;
  ingredients: string[];
  steps: string[];
};

const DEFAULT_RECIPES: RecipeCard[] = [
  {
    title: 'Honey Crust Croissant',
    time: '12 min',
    difficulty: 'Easy',
    blurb: 'Flaky layers with warm honey glaze.',
    badge: 'Bakery Fav',
    ingredients: ['Butter puff dough', 'Wildflower honey', 'Sea salt'],
    steps: ['Roll and cut dough', 'Bake until golden', 'Brush with honey glaze'],
  },
  {
    title: 'Ember Spice Muffin',
    time: '18 min',
    difficulty: 'Medium',
    blurb: 'Cinnamon, clove, and roasted sugar.',
    badge: 'New',
    ingredients: ['Spiced batter', 'Brown sugar', 'Clove crumble'],
    steps: ['Mix batter', 'Top with crumble', 'Bake and cool'],
  },
  {
    title: 'Shakehouse Sundae',
    time: '8 min',
    difficulty: 'Easy',
    blurb: 'Vanilla bean with candied crumbs.',
    badge: 'Fast',
    ingredients: ['Vanilla cream', 'Caramel crumbs', 'Toasted nuts'],
    steps: ['Scoop base', 'Add crumbs', 'Finish with nuts'],
  },
  {
    title: 'Midnight Rye Loaf',
    time: '25 min',
    difficulty: 'Hard',
    blurb: 'Deep caramel notes, slow-rise crust.',
    badge: 'Unlock Lv. 6',
    ingredients: ['Rye starter', 'Dark flour', 'Molasses'],
    steps: ['Feed starter', 'Slow rise dough', 'Bake in cast iron'],
  },
  {
    title: 'Citrus Glaze Tart',
    time: '15 min',
    difficulty: 'Medium',
    blurb: 'Zesty custard with a crisp shell.',
    badge: 'Seasonal',
    ingredients: ['Shortcrust base', 'Citrus zest', 'Cream custard'],
    steps: ['Blind bake shell', 'Cook custard', 'Chill and glaze'],
  },
];

function createRecipeBookMarkup(recipes: RecipeCard[]) {
  return `
    <div class="recipe-book-panel" role="dialog" aria-modal="true" aria-label="Recipe book overview">
      <div class="recipe-book-content">
        <div class="recipe-book-pages" data-recipe-book-pages>
          <article class="recipe-page recipe-page-cover is-active" data-recipe-page="0">
            <div class="recipe-page-inner recipe-cover-inner">
              <div class="recipe-cover-frame">
                <div class="recipe-cover-title">
                  <strong>Recipes</strong>
                </div>
                <div class="pixel-bread" aria-hidden="true"></div>
                <div class="recipe-cover-subtitle">Bake 'n Shake</div>
              </div>
            </div>
          </article>
          ${recipes
            .map(
              (recipe, index) => `
                <article class="recipe-page" data-recipe-page="${index + 1}">
                  <div class="recipe-page-inner">
                    <div class="recipe-page-header">
                      <div>
                        <h3>${recipe.title}</h3>
                        <p>${recipe.blurb}</p>
                      </div>
                      <span class="recipe-book-badge">${recipe.badge}</span>
                    </div>
                    <div class="recipe-page-meta">
                      <span>${recipe.time}</span>
                      <span>${recipe.difficulty}</span>
                    </div>
                    <div class="recipe-page-body">
                      <div class="recipe-page-section">
                        <h4>Ingredients</h4>
                        <ul>
                          ${recipe.ingredients.map((item) => `<li>${item}</li>`).join('')}
                        </ul>
                      </div>
                      <div class="recipe-page-section">
                        <h4>Steps</h4>
                        <ol>
                          ${recipe.steps.map((step) => `<li>${step}</li>`).join('')}
                        </ol>
                      </div>
                    </div>
                  </div>
                </article>
              `
            )
            .join('')}
        </div>
        <div class="recipe-book-nav">
          <button class="recipe-book-arrow" type="button" data-recipe-book-prev aria-label="Previous page">
            ‹
          </button>
          <button class="recipe-book-arrow" type="button" data-recipe-book-next aria-label="Next page">
            ›
          </button>
          <button
            class="recipe-book-arrow recipe-book-close"
            type="button"
            data-recipe-book-close
            aria-label="Close book"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  `;
}

export function initRecipeBookOverview() {
  const trigger = document.querySelector<HTMLButtonElement>('#recipe-book');
  if (!trigger) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'recipe-book-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = createRecipeBookMarkup(DEFAULT_RECIPES);

  document.body.appendChild(overlay);

  const closeButton = overlay.querySelector<HTMLButtonElement>('[data-recipe-book-close]');
  const panel = overlay.querySelector<HTMLDivElement>('.recipe-book-panel');
  const pages = Array.from(overlay.querySelectorAll<HTMLElement>('[data-recipe-page]'));
  const prevButton = overlay.querySelector<HTMLButtonElement>('[data-recipe-book-prev]');
  const nextButton = overlay.querySelector<HTMLButtonElement>('[data-recipe-book-next]');

  let currentIndex = 0;

  const updatePages = () => {
    pages.forEach((page, index) => {
      page.style.zIndex = String(pages.length - index);
      if (index < currentIndex) {
        page.classList.add('is-flipped');
        page.classList.remove('is-active');
        page.style.pointerEvents = 'none';
      } else if (index === currentIndex) {
        page.classList.remove('is-flipped');
        page.classList.add('is-active');
        page.style.pointerEvents = 'auto';
      } else {
        page.classList.remove('is-flipped');
        page.classList.remove('is-active');
        page.style.pointerEvents = 'none';
      }
    });

    if (prevButton) {
      prevButton.disabled = currentIndex === 0;
    }
    if (nextButton) {
      nextButton.disabled = currentIndex === pages.length - 1;
    }
  };

  const open = () => {
    overlay.classList.remove('is-closing');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    updatePages();
    closeButton?.focus();
  };

  const close = () => {
    overlay.classList.add('is-closing');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
      overlay.classList.remove('is-closing');
      trigger.focus();
    }, 520);
  };

  trigger.addEventListener('click', open);

  closeButton?.addEventListener('click', close);

  prevButton?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updatePages();
    }
  });

  nextButton?.addEventListener('click', () => {
    if (currentIndex < pages.length - 1) {
      currentIndex += 1;
      updatePages();
    }
  });
}
