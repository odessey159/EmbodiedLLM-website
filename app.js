const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation-links');
const dialog = document.querySelector('#detail-dialog');
let dialogTrigger = null;

function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu(); toggle.focus();
  }
});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-ready');
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('[data-reveal]').forEach(element => reveals.observe(element));
}

const gallery = document.querySelector('#feature-gallery');
const cards = Array.from(gallery.querySelectorAll('.feature-card'));
const previous = document.querySelector('#gallery-prev');
const next = document.querySelector('#gallery-next');
let galleryIndex = 0;
function updateGallery() {
  const maximum = gallery.scrollWidth - gallery.clientWidth;
  const atEnd = maximum > 4 && gallery.scrollLeft >= maximum - 4;
  const padding = parseFloat(getComputedStyle(gallery).paddingLeft);
  const edge = gallery.getBoundingClientRect().left + padding;
  const distances = cards.map(card => Math.abs(card.getBoundingClientRect().left - edge));
  galleryIndex = atEnd ? cards.length - 1 : distances.indexOf(Math.min(...distances));
  previous.disabled = gallery.scrollLeft < 4;
  next.disabled = maximum <= 4 || atEnd;
  document.querySelector('#gallery-current').textContent = String(galleryIndex + 1);
}
function moveGallery(direction) {
  const index = Math.min(cards.length - 1, Math.max(0, galleryIndex + direction));
  gallery.scrollTo({ left: cards[index].offsetLeft - parseFloat(getComputedStyle(gallery).paddingLeft), behavior: 'smooth' });
}
previous.addEventListener('click', () => moveGallery(-1));
next.addEventListener('click', () => moveGallery(1));
gallery.addEventListener('scroll', updateGallery, { passive: true });
gallery.addEventListener('keydown', event => {
  if (event.target === gallery && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault(); moveGallery(event.key === 'ArrowRight' ? 1 : -1);
  }
});
window.addEventListener('resize', updateGallery);
updateGallery();

const perspectives = {
  observe: { eyebrow: 'Observe', title: 'A scene.<br>More context.', description: 'Physical tasks begin with a view of the surroundings. Objects, positions, and relationships provide context for an action.' },
  understand: { eyebrow: 'Understand', title: 'A goal.<br>In context.', description: 'Language expresses what someone wants to do. Understanding connects that intent with what is present in the scene.' },
  act: { eyebrow: 'Act', title: 'Intent becomes<br>movement.', description: 'Robotic action brings digital instructions into a physical setting. An action changes the scene and creates new context.' },
  feedback: { eyebrow: 'Feedback', title: 'Keep the<br>connection open.', description: 'Observations after an action help describe what changed and what remains. Feedback brings that context back into the conversation.' }
};
document.querySelectorAll('[data-phase]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.phase;
  const item = perspectives[key];
  document.querySelectorAll('[data-phase]').forEach(control => {
    const selected = control === button;
    control.classList.toggle('selected', selected);
    control.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('[data-node]').forEach(node => node.classList.toggle('selected', node.dataset.node === key));
  document.querySelector('#phase-eyebrow').textContent = item.eyebrow;
  document.querySelector('#phase-title').innerHTML = item.title;
  document.querySelector('#phase-description').textContent = item.description;
}));

const details = {
  intent: { eyebrow: 'Task intent', title: 'Start with<br>the purpose.', description: 'Language gives a task its meaning. A clear description connects an intended outcome with the objects and relationships that matter in a physical setting.' },
  context: { eyebrow: 'Scene context', title: 'Make sense<br>of the scene.', description: 'A physical task takes place among objects, surfaces, and spatial relationships. Observations give language that surrounding context.' },
  action: { eyebrow: 'Action + feedback', title: 'A connected<br>perspective.', description: 'Actions change the physical world. Observations describe those changes. Bringing both into a shared view connects movement with the intended task.' }
};
document.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => {
  const item = details[button.dataset.detail];
  dialogTrigger = button;
  document.querySelector('#dialog-eyebrow').textContent = item.eyebrow;
  document.querySelector('#dialog-title').innerHTML = item.title;
  document.querySelector('#dialog-description').textContent = item.description;
  dialog.showModal(); dialog.scrollTop = 0; document.body.style.overflow = 'hidden';
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
dialog.addEventListener('close', () => { document.body.style.overflow = ''; dialogTrigger?.focus({ preventScroll: true }); });
