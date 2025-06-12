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

function loadSkills() {}
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





// Загрузка about.md
async function getMarkdown() {
  const res = await fetch('about.md');
  return await res.text();
}

// Запрос к OpenRouter
async function askAI(userMsg, markdown) {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMsg, markdown })
  });
  if (!res.ok) {
    throw new Error('Erreur lors de la requête au serveur');
  }
  const data = await res.json();
  // Если сервер возвращает ответ OpenRouter как есть:
  return data.choices[0].message.content;
}




// Логика чата ChatGPT-style
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ai-form');
  const input = document.getElementById('user-input');
  const chat = document.getElementById('chat-area');

  form.onsubmit = async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    // Сообщение пользователя
    appendMsg('user', question);
    input.value = '';
    scrollToBottom();

    // Плейсхолдер ответа
    const answerCard = appendMsg('assistant', '…');
    scrollToBottom();

    try {
      const md = await getMarkdown();
      const reply = await askAI(question, md);

      answerCard.querySelector('.message-text').textContent = reply;
      scrollToBottom();
    } catch (err) {
      answerCard.querySelector('.message-text').textContent = "Ошибка: " + err.message;
      scrollToBottom();
    }
  };

  function appendMsg(role, text) {
    const card = document.createElement('sl-card');
    card.className = 'msg ' + role;
    card.style.padding = '0';
    card.style.background = 'inherit';
    card.style.fontSize = 'inherit';
    card.style.color = 'inherit';
    card.style.border = 'inherit';
    card.style.boxShadow = 'inherit';
    card.style.borderRadius = 'inherit';
    card.style.marginBottom = '2px';
    card.style.maxWidth = '75%';
    card.style.alignSelf = role === 'user' ? 'flex-end' : 'flex-start';

    if (role === 'user') {
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="role-label" style="font-weight:700; opacity:0.6;">You</span>
          <span class="message-text" style="white-space:pre-line;">${text}</span>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="message-text" style="white-space:pre-line;">${text}</div>
      `;
    }
    chat.appendChild(card);
    return card;
  }


  function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
  }
});



