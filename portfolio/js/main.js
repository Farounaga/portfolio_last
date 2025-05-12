// ——— Функция переключения видимой секции ———
function showSection(id) {
  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === id);
  });

  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// ——— Навигация через Shoelace dropdown ———
const menu = document.querySelector('sl-menu');
menu.addEventListener('sl-select', event => {
  const id = event.detail.item.dataset.target;

  // Выделяем активный пункт
  menu.querySelectorAll('sl-menu-item').forEach(item => item.classList.remove('active'));
  event.detail.item.classList.add('active');

  showSection(id);
});

// ——— Навигация через кнопки <sl-button data-target> ———
document.querySelectorAll('sl-button[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.target;
    showSection(id);
  });
});

// ——— Переключение темы (light ↔ dark) ———
const themeSwitch = document.getElementById('theme-switch');
themeSwitch.addEventListener('sl-change', () => {
  document.documentElement.classList.toggle('sl-theme-dark', themeSwitch.checked);
});

// ——— Обработка <sl-include> (загрузка и ошибки) ———
document.querySelectorAll('sl-include').forEach(include => {
  include.classList.add('loading');
  include.innerHTML = '<sl-spinner style="display: block; margin: 20px auto;"></sl-spinner>';

  include.addEventListener('sl-load', () => {
    include.classList.remove('loading');
  });

  include.addEventListener('sl-error', e => {
    include.classList.remove('loading');
    include.innerHTML = `<p>Не удалось загрузить контент (код ${e.detail.status}).</p>`;
  });
});



// ——— Восстановление состояния из хэша и инициализация ———
document.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.substring(1);
  if (hash) {
    showSection(hash);
  } else {
    // По умолчанию показываем первую секцию
    const firstSection = document.querySelector(".page-section");
    if (firstSection) showSection(firstSection.id);
  }

  loadSkills();
});





/* tabs в presentation.html */
