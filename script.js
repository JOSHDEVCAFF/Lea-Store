const cartKey = 'lea-store-cart';

const formatCurrency = (value) => `₱${Number(value).toLocaleString('en-US')}`;

const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || '[]');
  } catch (error) {
    return [];
  }
};

const setCart = (items) => localStorage.setItem(cartKey, JSON.stringify(items));

const updateCartCount = () => {
  const cart = getCart();
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = cart.length;
  });
};

const addItemToTray = (item) => {
  const cart = getCart();
  cart.push(item);
  setCart(cart);
  updateCartCount();
};

const mountCartSummary = () => {
  const cart = getCart();
  const checkoutItems = document.querySelector('#checkoutItems');
  const paymentItems = document.querySelector('#paymentItems');
  const subtotalEl = document.querySelector('#subtotalAmount');
  const deliveryEl = document.querySelector('#deliveryAmount');
  const grandTotalEl = document.querySelector('#grandTotal');
  const paymentSubtotalEl = document.querySelector('#paymentSubtotal');
  const paymentDeliveryEl = document.querySelector('#paymentDelivery');
  const paymentTotalEl = document.querySelector('#paymentTotal');
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const delivery = cart.length ? 65 : 0;
  const total = subtotal + delivery;

  if (checkoutItems) {
    checkoutItems.innerHTML = cart.length ? cart.map((item, index) => `
      <div class="checkout-item" data-index="${index}">
        <div><strong>${item.name}</strong><small>${item.category}</small></div>
        <div class="checkout-item-controls"><span>${formatCurrency(item.price)}</span><button type="button" class="remove-item" data-remove-index="${index}">Remove</button></div>
      </div>
    `).join('') : '<p class="empty-state">Your tray is empty. Explore the menu to add dishes.</p>';
  }

  if (paymentItems) {
    paymentItems.innerHTML = cart.length ? cart.map((item) => `
      <div class="checkout-item"><div><strong>${item.name}</strong><small>${item.category}</small></div><span>${formatCurrency(item.price)}</span></div>
    `).join('') : '<p class="empty-state">Your payment summary is empty.</p>';
  }

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (deliveryEl) deliveryEl.textContent = formatCurrency(delivery);
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(total);
  if (paymentSubtotalEl) paymentSubtotalEl.textContent = formatCurrency(subtotal);
  if (paymentDeliveryEl) paymentDeliveryEl.textContent = formatCurrency(delivery);
  if (paymentTotalEl) paymentTotalEl.textContent = formatCurrency(total);
};

const handleCartRemoval = () => {
  document.querySelectorAll('[data-remove-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const cart = getCart();
      cart.splice(Number(button.dataset.removeIndex), 1);
      setCart(cart);
      updateCartCount();
      mountCartSummary();
      handleCartRemoval();
    });
  });
};

const handleAddToTray = () => {
  document.querySelectorAll('[data-add-to-tray]').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.menu-card');
      if (!card) return;
      addItemToTray({
        name: card.dataset.name,
        category: card.dataset.category,
        price: Number(card.dataset.price || 0),
      });
      button.textContent = 'Added';
      button.classList.add('is-added');
      setTimeout(() => {
        button.textContent = 'Add to Tray';
        button.classList.remove('is-added');
      }, 900);
    });
  });
};

const setupFilters = () => {
  const filterButtons = document.querySelectorAll('.filter-btn:not(.portfolio-category-btn)');
  const menuCards = document.querySelectorAll('.menu-card');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      menuCards.forEach((card) => {
        card.style.display = filter === 'all' || card.dataset.category === filter ? 'block' : 'none';
      });
    });
  });
};

const setupSlider = () => {
  const slides = document.querySelectorAll('.feature-slide');
  const sliderButtons = document.querySelectorAll('[data-slide]');
  if (!slides.length) return;
  let activeIndex = 0;
  const showSlide = (index) => slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  sliderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.slide === 'next' ? 1 : -1;
      activeIndex = (activeIndex + direction + slides.length) % slides.length;
      showSlide(activeIndex);
    });
  });
};

const setupFaq = () => {
  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach((faq) => faq.classList.remove('active'));
      if (!isOpen) item.classList.add('active');
    });
  });
};

const setupPortfolioPagination = () => {
  document.querySelectorAll('[data-portfolio-section]').forEach((section) => {
    const grid = section.querySelector('[data-project-grid]');
    const cards = grid ? [...grid.querySelectorAll('.project-card')] : [];
    const controls = [...section.querySelectorAll('[data-page-dir]')];
    const pageLabel = section.querySelector('[data-page-count]');
    if (!cards.length || !controls.length) return;

    let pageIndex = 0;
    const render = () => {
      const pageSize = window.innerWidth <= 768 ? 1 : 3;
      const pageCount = Math.max(1, Math.ceil(cards.length / pageSize));
      pageIndex = Math.min(pageIndex, pageCount - 1);
      cards.forEach((card, index) => {
        card.hidden = !(index >= pageIndex * pageSize && index < (pageIndex + 1) * pageSize);
      });
      if (pageLabel) pageLabel.textContent = `Page ${pageIndex + 1} of ${pageCount}`;
      controls.forEach((button) => {
        button.disabled = button.dataset.pageDir === 'prev' ? pageIndex === 0 : pageIndex === pageCount - 1;
      });
    };

    controls.forEach((button) => {
      button.addEventListener('click', () => {
        pageIndex += button.dataset.pageDir === 'next' ? 1 : -1;
        render();
      });
    });

    render();
    window.addEventListener('resize', render);
  });
};

const setupMenuToggle = () => {
  const toggle = document.querySelector('.menu-toggle');
  const sideMenu = document.querySelector('.side-menu');
  if (!toggle || !sideMenu) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    sideMenu.classList.toggle('open');
  });
  sideMenu.querySelectorAll('.nav-item').forEach((link) => {
    link.addEventListener('click', () => {
      sideMenu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
};

const handleFormSubmit = () => {
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Thanks for reaching out! Your message has been queued for the Lea Tapdasan team.');
    });
  }
  const paymentForm = document.querySelector('.payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Payment confirmed! Your order is being prepared for the next step.');
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  handleAddToTray();
  setupFilters();
  setupSlider();
  setupFaq();
  setupPortfolioPagination();
  setupMenuToggle();
  handleFormSubmit();
  mountCartSummary();
  handleCartRemoval();
});
