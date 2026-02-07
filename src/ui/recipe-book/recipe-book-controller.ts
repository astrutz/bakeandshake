import './recipe-book.css';

import { DEFAULT_RECIPES } from './recipe-book-data';
import { createRecipeBookMarkup } from './recipe-book-template';

export function initRecipeBookOverview(trigger?: HTMLElement | null) {
  const defaultFocusTarget = trigger ?? document.querySelector<HTMLElement>('#recipe-book');

  const open = (focusTargetOverride?: HTMLElement | null) => {
    const focusTarget = focusTargetOverride ?? defaultFocusTarget;
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
    const forwardDuration = '1s';
    const backwardDuration = '0.6s';

    const updatePages = () => {
      pagesRoot?.style.setProperty('--flip-duration', forwardDuration);
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

    const close = () => {
      overlay.classList.add('is-closing');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      currentIndex = 0;
      updatePages();
      window.setTimeout(() => {
        window.removeEventListener('keydown', onKeyDown, true);
        overlay.remove();
        focusTarget?.focus();
      }, 520);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!overlay.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }
      event.stopPropagation();
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          ' ',
          'Enter',
          'PageUp',
          'PageDown',
          'Home',
          'End',
          'p',
          'P',
        ].includes(event.key)
      ) {
        event.preventDefault();
      }
    };

    overlay.classList.remove('is-closing');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    updatePages();
    closeButton?.focus();

    closeButton?.addEventListener('click', close);
    window.addEventListener('keydown', onKeyDown, true);

    prevButton?.addEventListener('click', () => {
      if (currentIndex > 0) {
        pagesRoot?.style.setProperty('--flip-duration', backwardDuration);
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

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        close();
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
        pagesRoot.style.setProperty('--flip-duration', forwardDuration);
        const rotation = Math.max(-180, progress * 180);
        dragTarget.style.transform = `rotateY(${rotation}deg)`;
      } else if (progress > 0 && currentIndex > 0) {
        dragDirection = 'prev';
        pagesRoot.style.setProperty('--flip-duration', backwardDuration);
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
  };

  if (trigger) {
    trigger.addEventListener('click', () => open());
  }

  return open;
}
