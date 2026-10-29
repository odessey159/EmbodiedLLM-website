/* Static presentation and recorded-case exploration. */
const header = document.querySelector('#site-header');
const menuToggle = document.querySelector('.mobile-menu-toggle');
const menu = document.querySelector('#navigation-links');
const dialog = document.querySelector('#detail-dialog');
let dialogTrigger = null;
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menu.classList.remove('open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('open', open);
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menuToggle.focus();
  }
});
if ('IntersectionObserver' in window) {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('motion-ready');
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('[data-reveal]').forEach(element => reveals.observe(element));
  }
}

const gallery = document.querySelector('#highlight-track');
const cards = Array.from(gallery.querySelectorAll('.highlight-card'));
const previous = document.querySelector('#gallery-prev');
const next = document.querySelector('#gallery-next');
let galleryIndex = 0;
function updateGallery() {
  const maximum = gallery.scrollWidth - gallery.clientWidth;
  const atEnd = maximum > 4 && gallery.scrollLeft >= maximum - 4;
  const start = parseFloat(getComputedStyle(gallery).paddingLeft);
  const bounds = gallery.getBoundingClientRect();
  const distances = cards.map(card => Math.abs(card.getBoundingClientRect().left - bounds.left - start));
  galleryIndex = atEnd ? cards.length - 1 : distances.indexOf(Math.min.apply(null, distances));
  previous.disabled = gallery.scrollLeft < 4;
  next.disabled = maximum <= 4 || atEnd;
  document.querySelector('#gallery-current').textContent = String(galleryIndex + 1);
}
function moveGallery(direction) {
  const index = Math.min(cards.length - 1, Math.max(0, galleryIndex + direction));
  const padding = parseFloat(getComputedStyle(gallery).paddingLeft);
  gallery.scrollTo({ left: cards[index].offsetLeft - padding, behavior: 'smooth' });
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

const recordedCases = {
  bread: {
    task: 'U08 · ArrangeBreadBasket',
    title: 'First the bread.<br> Then the basket.',
    description: 'A long instruction becomes two stage-specific directions. The robot places the bread, then carries the basket to the dining counter.',
    steps: '1,127',
    image: 'assets/case-bread.svg',
    mobileImage: 'assets/case-bread-mobile.svg',
    alt: 'U08 event sequence: first 320 actions match the reference, instructions change at steps 321 and 513, and the task succeeds at step 1127.',
    reference: 'Reference: Harness 1.2.3.4 reached step 4,350 without success. This case uses a contemporaneous development comparison.',
    events: [
      { step: 320, kind: 'Matched trajectory prefix', title: 'The same first 320 actions.', body: 'The selected 1.2.3.4 and 1.2.3.5 attempts share their first 320 actions. Sampled full physics states at steps 0, 16, and 320 also agree.' },
      { step: 321, kind: 'New VLA instruction', title: 'Place the bread first.', body: 'The instruction is redirected to the current stage. Physical actions continue to come from the frozen VLA.', quote: 'Place the bread in the basket on the counter.' },
      { step: 513, kind: 'New VLA instruction', title: 'Carry the basket next.', body: 'The next instruction addresses moving the basket to the dining counter.', quote: 'Then move the basket to the dining counter.' },
      { step: 1127, kind: 'Environment outcome', title: 'Task completed.', body: 'The 1.2.3.5 attempt succeeds at control step 1,127. All 1,127 physical actions are VLA-generated; direct motor tools are not used.' }
    ]
  },
  presoak: {
    task: 'C10 · PreSoakPan',
    title: 'The pan is in.<br> The water is next.',
    description: 'The pan and sponge are in the sink, but the task still needs water. A new instruction makes the remaining subgoal explicit.',
    steps: '2,277',
    image: 'assets/case-presoak.svg',
    mobileImage: 'assets/case-presoak-mobile.svg',
    alt: 'C10 event sequence: first 1600 actions match the reference, the instruction changes at step 1601 to turn on water, and the task succeeds at step 2277.',
    reference: 'Reference: Harness 1.2.3.4 reached step 2,400 without success; the terminal subtask audit found 2 of 3 complete, with the water still off.',
    events: [
      { step: 1600, kind: 'Matched trajectory prefix', title: 'The same first 1,600 actions.', body: 'The compared attempts share the first 1,600 actions. At step 1,600, the three images actually delivered to the LLM are also identical.' },
      { step: 1601, kind: 'New VLA instruction', title: 'Make the remaining goal explicit.', body: 'The effective instruction changes as execution branches. The subsequent physical actions still come from the VLA.', quote: 'Then turn on the water.' },
      { step: 2277, kind: 'Environment outcome', title: 'Task completed.', body: 'The 1.2.3.5 attempt succeeds at control step 2,277. All 2,277 actions are VLA-generated, with no direct motor-tool steps.' }
    ]
  }
};
let activeCase = 'bread';
let activeEvent = 0;
const eventTabs = document.querySelector('#event-tabs');
function selectEvent(index) {
  activeEvent = index;
  const event = recordedCases[activeCase].events[index];
  eventTabs.querySelectorAll('button').forEach((button, i) => {
    button.classList.toggle('selected', i === index);
    button.setAttribute('aria-pressed', String(i === index));
  });
  document.querySelector('#event-kicker').textContent = event.kind + ' · Step ' + event.step.toLocaleString('en-US');
  document.querySelector('#event-title').textContent = event.title;
  document.querySelector('#event-body').textContent = event.body;
  const quote = document.querySelector('#event-quote');
  quote.textContent = event.quote ? '“' + event.quote + '”' : '';
  quote.hidden = !event.quote;
}
function selectCase(key) {
  activeCase = key;
  const item = recordedCases[key];
  document.querySelectorAll('[data-case]').forEach(button => {
    const selected = button.dataset.case === key;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('#case-task').textContent = item.task;
  document.querySelector('#case-heading').innerHTML = item.title;
  document.querySelector('#case-description').textContent = item.description;
  document.querySelector('#case-steps').textContent = item.steps;
  document.querySelector('#case-reference').textContent = item.reference;
  const image = document.querySelector('#case-image');
  image.src = item.image; image.alt = item.alt;
  document.querySelector('#case-image-mobile').srcset = item.mobileImage;
  eventTabs.replaceChildren();
  item.events.forEach((event, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Step ' + event.step.toLocaleString('en-US');
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => selectEvent(index));
    eventTabs.append(button);
  });
  selectEvent(0);
}
document.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => selectCase(button.dataset.case)));
selectCase('bread');

const details = {
  method: {
    eyebrow: 'The Harness framework', title: 'Guide the execution.<br> Keep the policy.',
    content: '<p>EmbodiedLLM studies how an external execution framework can organize the capabilities of a frozen vision-language-action policy. The Harness coordinates initial autonomy, progress assessment, recovery permissions, and handback.</p><ul class="dialog-list"><li><strong>Capability priors.</strong> Historical records inform the initial execution strategy.</li><li><strong>Current-subgoal progress.</strong> Recent evidence supports decisions to continue, review, or escalate.</li><li><strong>Progressive recovery.</strong> Prefer instruction adjustment; use bounded motor tools when authorized; prepare a handback to the VLA.</li><li><strong>Outcome verification.</strong> Preserve task identity and budgets, and use authoritative environment evidence for success.</li></ul>'
  },
  capability: {
    eyebrow: 'Initial autonomy allocation', title: 'Start with<br> capability.',
    content: '<p>One execution strategy need not suit every operation. Historical capability records provide context about reliable, weak, and unmeasured behavior before the first action.</p><p class="dialog-paragraph">These records inform how much autonomy to allocate and how closely to monitor. They are configuration-specific evidence, rather than a guarantee that the next attempt will succeed.</p>'
  },
  monitoring: {
    eyebrow: 'Substage progress monitoring', title: 'Stay with<br> the current goal.',
    content: '<p>A task can make early progress and then stall at a later subgoal. The Harness tracks the active stage, recent observations, and progress evidence to inform continuation, semantic review, or escalation.</p><p class="dialog-paragraph">Target identity, evidence freshness, and the remaining execution budget stay part of the decision. U08 and C10 show how an instruction can be redirected toward an unfinished stage.</p>'
  },
  recovery: {
    eyebrow: 'Recovery and handback', title: 'Adjust.<br> Recover. Return.',
    content: '<p>The framework prefers language-based recovery when it is appropriate: review the current objective, adjust the VLA instruction, and continue policy execution.</p><p class="dialog-paragraph">Direct motor tools are available only within the permitted recovery scope and budget. Explicit failures can permit earlier recovery. After intervention, the system prepares observations and state for a return to the VLA.</p><p class="dialog-paragraph">Permission to intervene is distinct from an intervention actually being executed.</p>'
  },
  study: {
    eyebrow: 'Historical RoboCasa catalog · Harness 1.2.3.5', title: 'Look at the result.<br> Understand the scope.',
    content: '<p>The fixed historical catalog contains 72 scenes: 28 Atomic-Seen, 24 Composite-Seen, and 20 Composite-Unseen. The selected 1.2.3.5 attempts completed 53 cases.</p><ul class="dialog-list"><li><strong>Historical successes.</strong> 39 of 42 retained success; 3 became unsuccessful.</li><li><strong>Historical failures.</strong> 14 of 30 became successful; 16 remained unsuccessful.</li><li><strong>Action sources.</strong> 75,150 VLA steps and 2,757 direct motor-tool steps, across 77,907 executed control steps.</li><li><strong>Catalog selection.</strong> This set was used during development and includes explicitly reused results and authorized recovery attempts.</li></ul><p class="dialog-paragraph">These are historical development observations, not an independent held-out benchmark or a full-leaderboard score. Execution paths and outcome changes do not isolate the contribution of individual rules. Control-step share does not measure autonomous time or overall efficiency.</p>'
  },
  'case-scope': {
    eyebrow: 'U08 and C10 · Recorded trace comparison', title: 'A shared prefix.<br> A visible change.',
    content: '<p>These two cases use the contemporaneous six-case development comparison from October 22, 2026: Harness 1.2.3.4 versus 1.2.3.5. The selected 1.2.3.5 attempts are also included in the historical 72-case catalog.</p><p class="dialog-paragraph">The reference attempts belong to a different batch from the earlier aggregate 72-case 1.2.3.4 evaluation. They are not a pure-VLA baseline.</p><ul class="dialog-list"><li><strong>U08.</strong> First 320 actions match; instructions change at steps 321 and 513; success at 1,127.</li><li><strong>C10.</strong> First 1,600 actions and the model-bound images at step 1,600 match; instruction changes at 1,601; success at 2,277.</li></ul><p class="dialog-paragraph">The traces support a combined progress-review, context, and instruction-adjustment mechanism. They do not isolate a single phrase or threshold as the cause.</p>'
  },
  handback: {
    eyebrow: 'SC23 · WashLettuce', title: 'A bounded interval.<br> An explicit return.',
    content: '<p>Public Harness reviews at control steps 575 and 703 classified two acquisition misses. Direct control then ran from step 704 through 941, a total of 238 steps. VLA execution resumed at 942, and the task completed at 1,242.</p><p class="dialog-paragraph">The public feedback at step 941 still described the geometric grasp attempts as unsuccessful. This record demonstrates the escalation and handback path; it does not establish that the direct grasp itself succeeded or caused the final outcome.</p>'
  }
};
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
  const detail = details[button.dataset.open];
  if (!detail) return;
  dialogTrigger = button;
  document.querySelector('#dialog-eyebrow').textContent = detail.eyebrow;
  document.querySelector('#dialog-title').innerHTML = detail.title;
  document.querySelector('#dialog-content').innerHTML = detail.content;
  dialog.showModal(); dialog.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => { document.body.style.overflow = ''; dialogTrigger?.focus({ preventScroll: true }); });
