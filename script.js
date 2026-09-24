const chatStream = document.getElementById('chat-stream');
const chatInput = document.getElementById('chat-input');
const chatForm = document.getElementById('chat-form');
const clearButton = document.getElementById('clear-chat-btn');

const conversation = [];

function formatCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Converts LaTeX-style math the UI can't render (\text{}, $...$, \rightarrow, subscripts)
// into plain readable text. Runs BEFORE escaping since none of these chars need escaping.
function stripLatexMath(text) {
  return text
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, inner) => inner)
    .replace(/\$([^$\n]+)\$/g, (_, inner) => inner)
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\to\b/g, '→')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/_\{(\d+)\}/g, '$1')
    .replace(/_(\d+)/g, '$1')
    .replace(/\\[a-zA-Z]+/g, ''); // fallback: drop any other stray LaTeX commands
}

// Applies inline formatting to an already-escaped line (bold, inline code).
function formatInline(escapedLine) {
  return escapedLine
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10">$1</code>');
}

function formatAiText(rawText) {
  const lines = stripLatexMath(rawText).split('\n');
  let html = '';
  let listItems = [];
  let listTag = null;

  function flushList() {
    if (!listItems.length) return;
    const cls = listTag === 'ol'
      ? 'list-decimal list-inside space-y-1 my-2 pl-1'
      : 'list-disc list-inside space-y-1 my-2 pl-1';
    html += `<${listTag} class="${cls}">${listItems.join('')}</${listTag}>`;
    listItems = [];
    listTag = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) { flushList(); continue; }

    if (/^-{3,}$/.test(trimmed)) {
      flushList();
      html += '<hr class="my-3 border-white/10">';
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushList();
      const sizeClass = heading[1].length <= 2 ? 'text-base' : 'text-sm';
      html += `<div class="${sizeClass} font-bold text-white mt-3 mb-1 first:mt-0">${formatInline(escapeHtml(heading[2]))}</div>`;
      continue;
    }

    const ordered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ordered) {
      if (listTag !== 'ol') { flushList(); listTag = 'ol'; }
      listItems.push(`<li>${formatInline(escapeHtml(ordered[1]))}</li>`);
      continue;
    }

    const bullet = trimmed.match(/^[*-]\s+(.*)$/);
    if (bullet) {
      if (listTag !== 'ul') { flushList(); listTag = 'ul'; }
      listItems.push(`<li>${formatInline(escapeHtml(bullet[1]))}</li>`);
      continue;
    }

    flushList();
    html += `<p class="mb-2 last:mb-0">${formatInline(escapeHtml(trimmed))}</p>`;
  }
  flushList();
  return html;
}

function addUserMessage(text) {
  const time = formatCurrentTime();
  const wrapper = document.createElement('div');
  wrapper.className = 'msg-fade-in flex flex-col items-end gap-1.5 ml-auto max-w-[85%] sm:max-w-[75%]';
  wrapper.innerHTML = `
    <div class="flex items-center gap-1.5 pr-1 text-[11px] text-on-surface-variant/70">
      <span>You</span><span>•</span><span>${time}</span>
    </div>
    <div class="px-4 py-3 rounded-2xl rounded-br-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium shadow-[0_4px_16px_rgba(124,58,237,0.3)] leading-relaxed break-words">
      ${escapeHtml(text)}
    </div>`;
  chatStream.appendChild(wrapper);
  chatStream.scrollTop = chatStream.scrollHeight;
}

function showTypingIndicator() {
  removeTypingIndicator();
  const wrapper = document.createElement('div');
  wrapper.id = 'typing-indicator';
  wrapper.className = 'msg-fade-in flex items-start gap-3 max-w-[95%] sm:max-w-[90%] mr-auto';
  wrapper.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-container to-violet-700 p-[1px] shrink-0 mt-1 shadow-[0_0_12px_rgba(160,120,255,0.3)]">
      <div class="w-full h-full rounded-[10px] bg-[#10131e] flex items-center justify-center">
        <span class="material-symbols-outlined text-primary text-base">smart_toy</span>
      </div>
    </div>
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center gap-2 pl-1 text-[11px]">
        <span class="font-headline font-bold text-white">Study Buddy AI</span>
        <span class="text-on-surface-variant/60">thinking...</span>
      </div>
      <div class="px-4 py-3 rounded-2xl rounded-tl-xs bg-[#121622] border border-white/10 flex items-center gap-1.5 shadow-md">
        <span class="w-2 h-2 rounded-full bg-primary/80 typing-dot"></span>
        <span class="w-2 h-2 rounded-full bg-primary/80 typing-dot"></span>
        <span class="w-2 h-2 rounded-full bg-primary/80 typing-dot"></span>
      </div>
    </div>`;
  chatStream.appendChild(wrapper);
  chatStream.scrollTop = chatStream.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

function addAiMessage(text) {
  const time = formatCurrentTime();
  const wrapper = document.createElement('div');
  wrapper.className = 'msg-fade-in flex items-start gap-3 max-w-[95%] sm:max-w-[90%] mr-auto';
  wrapper.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-container to-violet-700 p-[1px] shrink-0 mt-1 shadow-[0_0_12px_rgba(160,120,255,0.3)]">
      <div class="w-full h-full rounded-[10px] bg-[#10131e] flex items-center justify-center">
        <span class="material-symbols-outlined text-primary text-base">smart_toy</span>
      </div>
    </div>
    <div class="flex flex-col gap-1.5 flex-1 min-w-0">
      <div class="flex items-center gap-2 pl-1 text-[11px]">
        <span class="font-headline font-bold text-white">Study Buddy AI</span>
        <span class="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold text-[10px]">Tutor</span>
        <span class="text-on-surface-variant/60">${time}</span>
      </div>
      <div class="p-4 sm:p-5 rounded-2xl rounded-tl-xs bg-[#121622] border border-white/10 text-[#dfe2f1] text-sm shadow-md">
        <div class="leading-relaxed">${formatAiText(text)}</div>
        <div class="flex items-center gap-1.5 pt-3 mt-2 border-t border-white/5">
          <button type="button" class="action-btn px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-on-surface-variant hover:text-white text-[11px] font-medium transition-all inline-flex items-center gap-1 cursor-pointer">
            <span>📋</span><span class="btn-text">Copy</span>
          </button>
        </div>
      </div>
    </div>`;

  const copyButton = wrapper.querySelector('.action-btn');
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      copyButton.querySelector('.btn-text').textContent = 'Copied!';
      setTimeout(() => copyButton.querySelector('.btn-text').textContent = 'Copy', 1500);
    } catch {
      copyButton.querySelector('.btn-text').textContent = 'Copy failed';
    }
  });

  chatStream.appendChild(wrapper);
  chatStream.scrollTop = chatStream.scrollHeight;
}

async function askStudyBuddy(prompt) {
  const message = prompt.trim();
  if (!message) return;

  addUserMessage(message);
  chatInput.value = '';
  showTypingIndicator();

  const button = document.getElementById('send-button');
  if (button) button.disabled = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: conversation })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');

    removeTypingIndicator();
    addAiMessage(data.answer);

    conversation.push({ role: 'user', text: message });
    conversation.push({ role: 'model', text: data.answer });
    if (conversation.length > 12) conversation.splice(0, conversation.length - 12);
  } catch (error) {
    console.error(error);
    removeTypingIndicator();
    addAiMessage(`Sorry, I couldn't answer that right now. ${error.message}`);
  } finally {
    if (button) button.disabled = false;
    chatInput.focus();
  }
}

function clearChat() {
  conversation.length = 0;
  chatStream.innerHTML = `
    <div class="msg-fade-in text-center py-12 px-4 space-y-2">
      <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary text-xl">✨</div>
      <h3 class="font-headline font-bold text-white text-base">Conversation Cleared</h3>
      <p class="text-on-surface-variant text-xs max-w-sm mx-auto">Ready for your next topic! Select a quick prompt above or type anything below to begin.</p>
    </div>`;
}

chatForm?.addEventListener('submit', event => {
  event.preventDefault();
  askStudyBuddy(chatInput.value);
});

document.querySelectorAll('.prompt-chip').forEach(button => {
  button.addEventListener('click', () => askStudyBuddy(button.dataset.prompt || ''));
});

clearButton?.addEventListener('click', clearChat);
