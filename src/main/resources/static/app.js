const input = document.querySelector('#message-input');
const form = document.querySelector('#chat-form');
const sendButton = document.querySelector('#send-button');
const conversation = document.querySelector('#conversation');
const messages = document.querySelector('#messages');
const welcome = document.querySelector('#welcome');
const clearButtons = [document.querySelector('#new-chat'), document.querySelector('#clear-chat')];
const conversationSelect = document.querySelector('#conversation-select');
const reloadButton = document.querySelector('#reload-chat');
const memoryNote = document.querySelector('#memory-note');
const storageKey = 'school-agent.conversation-id';
let conversationId = null;
let busy = false;
let ready = false;
let remoteRunning = false;
let pollTimer;

// 浏览器仅持久化会话 ID；消息、模型结果和执行过程由服务端保存。
async function loadModelInfo() {
  try {
    const response = await fetch('/api/agent/info');
    if (!response.ok) throw new Error('服务未连接');
    const info = await response.json();
    document.querySelector('#model-name').textContent = info.displayName;
    document.querySelector('#sidebar-model').textContent = info.displayName.replace(/^DeepSeek-/, '');
    document.querySelector('#connection').className = 'connection ready';
    document.querySelector('#connection span').textContent = '本地服务已连接';
  } catch {
    document.querySelector('#connection').className = 'connection failed';
    document.querySelector('#connection span').textContent = '服务未连接';
  }
}

function refreshInput() {
  document.querySelector('#char-count').textContent = `${input.value.length} / 2000`;
  sendButton.disabled = busy || !ready || remoteRunning || !input.value.trim();
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
}

function setBusy(value) {
  busy = value;
  sendButton.querySelector('span').textContent = value ? '处理中' : '发送';
  clearButtons.forEach(button => { button.disabled = value; });
  conversationSelect.disabled = value;
  reloadButton.disabled = value;
  document.querySelectorAll('.suggestion').forEach(button => { button.disabled = value || !ready || remoteRunning; });
  refreshInput();
}

function scrollToBottom() {
  conversation.scrollTop = conversation.scrollHeight;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  // 用户文本、模型文本和工具输出都按文本渲染，避免模型输出成为可执行 HTML。
  if (text !== undefined) node.textContent = text;
  return node;
}

function addMessage(role, text, extraClass = '') {
  welcome.hidden = true;
  const row = element('article', `message ${role} ${extraClass}`);
  const avatar = element('div', 'avatar', role === 'user' ? '你' : '教');
  avatar.setAttribute('aria-hidden', 'true');
  const content = element('div', 'message-content');
  content.append(element('div', 'message-label', role === 'user' ? '你' : '教务助手'));
  const body = element('div', 'message-text', text);
  content.append(body);
  row.append(avatar, content);
  messages.append(row);
  scrollToBottom();
  return { row, content, body };
}

function prettyJson(text) {
  try { return JSON.stringify(JSON.parse(text), null, 2); }
  catch { return text; }
}

function appendToolSteps(content, result) {
  if (!result.steps.length) return;
  const details = element('details', 'tool-details');
  details.append(element('summary', '', `查看执行过程 · ${result.steps.length} 次工具调用 / ${result.modelCalls} 轮模型请求`));
  const labels = { findClasses: '查询班级', getClassInfo: '班级详情', createClass: '创建班级',
    findTeachers: '查找教师', findStudentHours: '学员课时', getTimetable: '查询课表',
    getConsumption: '课消明细', findTasks: '查询任务', getTaskProgress: '任务完成情况' };
  result.steps.forEach(step => {
    const panel = element('div', 'tool-step');
    panel.append(element('h4', '', `第 ${step.round} 轮 · ${labels[step.tool] || step.tool}`));
    panel.append(element('b', '', `${step.tool} · 输入`));
    panel.append(element('pre', '', prettyJson(step.arguments)));
    panel.append(element('b', '', '工具返回'));
    panel.append(element('pre', '', prettyJson(step.observation)));
    details.append(panel);
  });
  content.append(details);
}

async function api(path, options = {}) {
  const response = await fetch(`/api/agent${path}`, options);
  const text = await response.text();
  const result = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(`${result?.detail || '请求未完成。'}${result?.errorId ? `\n错误编号：${result.errorId}` : ''}`);
    error.status = response.status;
    throw error;
  }
  return result;
}

async function refreshConversations() {
  const items = await api('/conversations');
  conversationSelect.replaceChildren();
  items.forEach(item => {
    const option = element('option', '', item.title);
    option.value = item.id;
    conversationSelect.append(option);
  });
  if (conversationId) conversationSelect.value = conversationId;
  return items;
}

function renderConversation(view) {
  messages.replaceChildren();
  welcome.hidden = view.turns.length > 0;
  remoteRunning = false;
  view.turns.forEach(turn => {
    addMessage('user', turn.message);
    if (turn.status === 'COMPLETED') {
      const answer = addMessage('assistant', turn.response.answer);
      appendToolSteps(answer.content, turn.response);
    } else if (turn.status === 'RUNNING') {
      remoteRunning = true;
      addMessage('assistant', '请求仍在处理中，正在等待保存结果…', 'pending');
    } else {
      addMessage('assistant', turn.error, 'error');
    }
  });
  memoryNote.textContent = view.totalTurns > view.turns.length
    ? `当前展示最近 ${view.turns.length} / ${view.totalTurns} 轮；完整记录已保存。模型参考最近 6 轮已完成对话。`
    : '对话已自动保存，刷新或重启后可继续。模型参考最近 6 轮已完成对话。';
  refreshInput();
}

async function loadConversation(id) {
  clearTimeout(pollTimer);
  const view = await api(`/conversations/${id}`);
  conversationId = view.conversationId;
  localStorage.setItem(storageKey, conversationId);
  conversationSelect.value = conversationId;
  ready = true;
  renderConversation(view);
  schedulePoll();
  return view;
}

// 页面刷新或 HTTP 等待超时后，只读取已受理请求的状态，不重发模型/业务操作。
function schedulePoll() {
  clearTimeout(pollTimer);
  if (!remoteRunning) return;
  const id = conversationId;
  pollTimer = setTimeout(async () => {
    if (busy || id !== conversationId) return;
    setBusy(true);
    try {
      await loadConversation(id);
      if (!remoteRunning) await refreshConversations();
    } catch {
      ready = false;
      memoryNote.textContent = '暂时无法读取已保存会话，请点击“刷新记录”恢复。';
    } finally { setBusy(false); }
  }, 2000);
}

async function newConversation() {
  const created = await api('/conversations', { method: 'POST' });
  await loadConversation(created.id);
  await refreshConversations();
}

async function restoreConversation() {
  setBusy(true);
  try {
    const items = await refreshConversations();
    const saved = localStorage.getItem(storageKey);
    const selected = items.find(item => item.id === saved) || items[0];
    if (selected) await loadConversation(selected.id);
    else await newConversation();
  } catch (error) {
    ready = false;
    memoryNote.textContent = `会话读取失败：${error.message} 请点击“刷新记录”重试读取。`;
  } finally { setBusy(false); }
}

async function sendMessage(text) {
  const message = text.trim();
  if (busy || !ready || remoteRunning || !message) return;
  setBusy(true);
  input.value = '';
  refreshInput();
  addMessage('user', message);
  const pending = addMessage('assistant', '正在处理，请稍候…', 'pending');
  pending.body.prepend(element('span', 'pending-dot'));
  const started = performance.now();
  const requestId = crypto.randomUUID();
  try {
    const result = await api('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationId, requestId }),
      signal: AbortSignal.timeout(195000)
    });
    pending.row.remove();
    const answer = addMessage('assistant', result.answer);
    appendToolSteps(answer.content, result);
    answer.content.append(element('div', 'response-meta', `已完成 · ${((performance.now() - started) / 1000).toFixed(1)} 秒`));
    await refreshConversations().catch(() => {
      memoryNote.textContent = '本轮已保存，历史会话列表暂未刷新。';
    });
  } catch (error) {
    pending.row.remove();
    const messageText = error.name === 'TimeoutError' ? '等待响应超时，暂时无法确认执行结果。' :
      error instanceof TypeError ? '无法连接本地服务，请确认 Spring Boot 应用仍在运行。' : error.message;
    // 连接中断时服务端可能已经执行创建，不能用通用重试按钮重复写入。
    addMessage('assistant', `${messageText}\n若本次涉及创建，请先查询班级列表确认结果。`, 'error');
    // 查询服务器实际状态；读取失败时阻止继续发送，避免以缺失上下文执行操作。
    try {
      const view = await loadConversation(conversationId);
      if (!view.turns.some(turn => turn.requestId === requestId)) {
        addMessage('assistant', messageText, 'error');
        input.value = message;
      }
    }
    catch {
      ready = false;
      memoryNote.textContent = '暂时无法读取会话，请恢复服务后点击“刷新记录”。';
    }
  } finally {
    setBusy(false);
    scrollToBottom();
    input.focus();
  }
}

form.addEventListener('submit', event => { event.preventDefault(); sendMessage(input.value); });
input.addEventListener('input', refreshInput);
input.addEventListener('keydown', event => {
  // 中文输入法确认候选字时不发送消息。
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    if (!sendButton.disabled) form.requestSubmit();
  }
});
document.querySelectorAll('.suggestion').forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.fill !== undefined) {
      input.value = button.dataset.message;
      refreshInput();
      input.focus();
    } else {
      sendMessage(button.dataset.message);
    }
  });
});
async function changeConversation(action) {
  if (busy) return;
  setBusy(true);
  clearTimeout(pollTimer);
  try {
    await action();
    input.value = '';
  } catch (error) {
    conversationSelect.value = conversationId || '';
    memoryNote.textContent = error.message;
  } finally {
    setBusy(false);
    schedulePoll();
    input.focus();
  }
}
document.querySelector('#new-chat').addEventListener('click', () => changeConversation(newConversation));
document.querySelector('#clear-chat').addEventListener('click', () => changeConversation(async () => {
  if (conversationId) await api(`/conversations/${conversationId}`, { method: 'DELETE' });
  conversationId = null;
  ready = false;
  remoteRunning = false;
  localStorage.removeItem(storageKey);
  messages.replaceChildren();
  welcome.hidden = false;
  await newConversation();
}));
conversationSelect.addEventListener('change', () => changeConversation(() => loadConversation(conversationSelect.value)));
reloadButton.addEventListener('click', restoreConversation);
loadModelInfo();
restoreConversation();
