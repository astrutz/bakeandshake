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
    title: 'Mona\'s Dinkelbrot',
    time: '1 h 5 min',
    difficulty: 'Einfach',
    blurb: 'Ein sehr einfaches Brot mit Übernachtgare und knuspriger Kruste.',
    badge: 'Mona Core',
    ingredients: [
      '10 g frische Hefe',
      '450 g lauwarmes Wasser',
      '600 g Dinkelmehl (Type 630)',
      '15 g Salz',
      '10 g Zucker',
    ],
    steps: [
      'Hefe im lauwarmen Wasser auflösen, dann alle Zutaten kurz mit einem Löffel verrühren (nicht kneten).',
      'Teig abgedeckt 8–12 Stunden im Kühlschrank reifen lassen.',
      'Topf (Gusseisen oder ofenfest) im Ofen auf 250 °C Ober-/Unterhitze vorheizen.',
      'Teig auf bemehltes Backpapier stürzen, über die Seiten falten und mit Papier in den heißen Topf setzen.',
      '30 Minuten mit Deckel backen, dann auf 200 °C reduzieren und weitere 20 Minuten ohne Deckel backen.',
    ],
  },
  {
    title: 'Pizzateig',
    time: '1 h 15 min',
    difficulty: 'Einfach',
    blurb: 'Klassischer Pizzateig mit kurzer Gehzeit.',
    badge: 'Brot',
    ingredients: [
      '250 ml lauwarmes Wasser',
      '1 Wuerfel frische Hefe (ca. 42 g)',
      '1 Prise Zucker',
      '2 EL Oel',
      '500 g Mehl (plus etwas zum Arbeiten)',
      '1 TL Salz',
    ],
    steps: [
      'Hefe im lauwarmen Wasser mit Zucker und Salz verruehren und 10-15 Minuten gehen lassen.',
      'Mehl und Salz mischen, Hefewasser und Oel zugeben und mindestens 5 Minuten kneten, bis der Teig glatt ist.',
      'Abgedeckt an einem warmen Ort etwa 40 Minuten gehen lassen.',
      'Teig teilen, rund ausrollen, bei 240 Grad (Umluft 220) belegen und ca. 15 Minuten backen.',
    ],
  },
  {
    title: 'Focaccia',
    time: '1 h 55 min',
    difficulty: 'Einfach',
    blurb: 'Italienisches Fladenbrot mit Olivenoel und Rosmarin.',
    badge: 'Brot',
    ingredients: [
      '500 g Mehl (Type 405)',
      '21 g Frischhefe (oder 7 g Trockenhefe)',
      '1 EL Olivenoel',
      '300 ml lauwarmes Wasser',
      '1 Prise Zucker',
      '2 TL Salz',
      'Olivenoel fuer die Form und den Belag',
      'Meersalz',
      'frischer Rosmarin',
    ],
    steps: [
      'Hefe in lauwarmem Wasser mit Olivenoel verruehren.',
      'Mehl mit Salz und Zucker mischen, Hefewasser zugeben und etwa 10 Minuten zu einem glatten Teig kneten.',
      'Teig abgedeckt ca. 45 Minuten ruhen lassen.',
      'Teig in eine geoelte Form geben, in die Ecken druecken, Olivenoel darueber geben und Mulden eindruecken.',
      'Mit Meersalz und Rosmarin bestreuen, nochmals ca. 45 Minuten ruhen lassen.',
      'Bei 200 Grad Umluft etwa 20-25 Minuten backen.',
    ],
  },
];

function createRecipeBookMarkup(recipes: RecipeCard[]) {
  return `
    <div class="recipe-book-panel" role="dialog" aria-modal="true" aria-label="Recipe book overview">
      <div class="recipe-book-content">
        <div class="recipe-book-close-wrapper">
          <button
            class="recipe-book-close"
            type="button"
            data-recipe-book-close
            aria-label="Close book"
          >
            <svg class="recipe-book-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>  
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
                <img class="recipe-cover-icon" src="/croissant.png" alt="Croissant" />
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
        </div>
        <div class="recipe-book-nav">
          <button class="recipe-book-arrow" type="button" data-recipe-book-prev aria-label="Previous page">
            <svg class="recipe-book-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button class="recipe-book-arrow" type="button" data-recipe-book-next aria-label="Next page">
            <svg class="recipe-book-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
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
  const pages = Array.from(overlay.querySelectorAll<HTMLElement>('[data-recipe-page]'));
  const pagesRoot = overlay.querySelector<HTMLDivElement>('[data-recipe-book-pages]');
  const prevButton = overlay.querySelector<HTMLButtonElement>('[data-recipe-book-prev]');
  const nextButton = overlay.querySelector<HTMLButtonElement>('[data-recipe-book-next]');

  let currentIndex = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragTarget: HTMLElement | null = null;
  let dragDirection: 'next' | 'prev' | null = null;

  const updatePages = () => {
    pages.forEach((page, index) => {
      page.style.zIndex = String(pages.length - index);
      page.style.transform = '';
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

  pagesRoot?.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement | null)?.closest('button')) return;
    const page = pages[currentIndex];
    if (!page) return;
    isDragging = true;
    dragStartX = event.clientX;
    dragTarget = page;
    dragDirection = null;
    pagesRoot.setPointerCapture(event.pointerId);
  });

  pagesRoot?.addEventListener('pointermove', (event) => {
    if (!isDragging || !dragTarget || !pagesRoot) return;
    const rect = pagesRoot.getBoundingClientRect();
    const deltaX = event.clientX - dragStartX;
    const progress = Math.max(-1, Math.min(1, deltaX / rect.width));

    if (progress < 0) {
      if (currentIndex >= pages.length - 1) {
        dragDirection = null;
        dragTarget.style.transform = '';
        return;
      }
      dragDirection = 'next';
      const rotation = Math.max(-180, progress * 180);
      dragTarget.style.transform = `rotateY(${rotation}deg)`;
    } else if (progress > 0 && currentIndex > 0) {
      dragDirection = 'prev';
      const prevPage = pages[currentIndex - 1];
      dragTarget = prevPage;
      const rotation = -180 + progress * 180;
      prevPage.style.transform = `rotateY(${Math.min(0, rotation)}deg)`;
    } else {
      dragDirection = null;
    }
  });

  pagesRoot?.addEventListener('pointerup', (event) => {
    if (!isDragging) return;
    isDragging = false;
    pagesRoot.releasePointerCapture(event.pointerId);
    const deltaX = event.clientX - dragStartX;
    const rect = pagesRoot.getBoundingClientRect();
    const progress = deltaX / rect.width;

    if (dragDirection === 'next' && progress < -0.3 && currentIndex < pages.length - 1) {
      currentIndex += 1;
    } else if (dragDirection === 'prev' && progress > 0.3 && currentIndex > 0) {
      currentIndex -= 1;
    }

    dragTarget = null;
    dragDirection = null;
    updatePages();
  });

  pagesRoot?.addEventListener('pointercancel', () => {
    if (!isDragging) return;
    isDragging = false;
    dragTarget = null;
    dragDirection = null;
    updatePages();
  });
}
