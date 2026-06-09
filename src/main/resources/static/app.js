const state = {
  role: null,
  sessionId: null,
  participantId: null,
  participantName: null,
  isHost: false,
  currentQuestionId: null,
  selectedOption: null,
  sessionPollHandle: null,
  leaderboardPollHandle: null,
  pollMode: null,
  inFlightSession: false,
  inFlightLeaderboard: false,
  lastLeaderboardSignature: "",
  lastLeaderboardRanks: {},
  dsaInsights: null,
  authUser: null,
  authToken: null,
  authRole: null,
  activeAuthTab: "login",
  hiddenPlayers: new Set(),
  recentScores: [],
  lastSyncAt: 0,
};

const screens = [
  "home",
  "auth",
  "dashboard",
  "create",
  "join",
  "lobby",
  "live",
  "leaderboard",
  "results",
  "profile",
  "thanks",
];

const LOBBY_POLL_INTERVAL_MS = 3000;
const LIVE_POLL_INTERVAL_MS = 2000;
const LEADERBOARD_POLL_INTERVAL_MS = 1500;
const API_BASE_URL = (() => {
  const configValue = (window.__QUIZ_PLATFORM_CONFIG__ && window.__QUIZ_PLATFORM_CONFIG__.apiBaseUrl) || "";
  const metaNode = document.querySelector('meta[name="quiz-api-base-url"]');
  const metaValue = metaNode ? metaNode.content : "";
  const candidate = String(configValue || metaValue).trim();
  return candidate ? candidate.replace(/\/+$/, "") : "";
})();

function byId(id) {
  return document.getElementById(id);
}

function resolveApiUrl(url) {
  if (!API_BASE_URL || /^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function api(url, options = {}) {
  try {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (state.authToken) {
      headers.Authorization = `Bearer ${state.authToken}`;
    }
    const response = await fetch(resolveApiUrl(url), {
      headers,
      ...options,
    });

    if (!response.ok) {
      let message = "Request failed";
      try {
        const errorJson = await response.json();
        message = errorJson.message || message;
      } catch {
        const text = await response.text();
        message = text || message;
      }
      throw new Error(message);
    }

    hideGlobalError();
    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      showGlobalError("Network unavailable. Check backend connectivity and retry.");
      throw new Error("Network request failed");
    }
    throw error;
  }
}

function showGlobalError(message) {
  const el = byId("global-error");
  if (!el) return;
  el.hidden = false;
  el.textContent = message;
}

function hideGlobalError() {
  const el = byId("global-error");
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
}

function announce(message) {
  const el = document.getElementById('sr-announcer');
  if (!el) return;
  el.textContent = '';
  // small delay so repeated same-text announcements fire
  setTimeout(() => { el.textContent = message; }, 50);
}

function showScreen(name) {
  screens.forEach((screen) => {
    const node = byId(`screen-${screen}`);
    if (!node) return;
    node.classList.toggle("active", screen === name);
  });

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.classList.toggle("active-nav", button.dataset.nav === name);
  });

  const labels = {
    home: 'Home', auth: 'Authentication', dashboard: 'Dashboard',
    create: 'Create Session', join: 'Join Session', lobby: 'Waiting Lobby',
    live: 'Live Quiz', leaderboard: 'Leaderboard', results: 'Session Results',
    profile: 'Profile & Settings', thanks: 'Thank You',
  };
  announce(labels[name] || name);

  // Move focus to the screen heading for keyboard users
  const activeScreen = byId(`screen-${name}`);
  if (activeScreen) {
    const heading = activeScreen.querySelector('h2');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
  }
}

function parseQuestionIds(raw) {
  return raw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((id) => !Number.isNaN(id));
}

function stopPolling() {
  if (state.sessionPollHandle) {
    clearInterval(state.sessionPollHandle);
    state.sessionPollHandle = null;
  }
  if (state.leaderboardPollHandle) {
    clearInterval(state.leaderboardPollHandle);
    state.leaderboardPollHandle = null;
  }
  state.pollMode = null;
}

function startSessionPolling(mode) {
  const interval = mode === "LIVE" ? LIVE_POLL_INTERVAL_MS : LOBBY_POLL_INTERVAL_MS;
  if (state.sessionPollHandle && state.pollMode === mode) return;
  if (state.sessionPollHandle) clearInterval(state.sessionPollHandle);

  state.pollMode = mode;
  state.sessionPollHandle = setInterval(loadSessionState, interval);
}

function startLeaderboardPolling() {
  if (state.leaderboardPollHandle) return;
  state.leaderboardPollHandle = setInterval(() => manualLeaderboardRefresh(false), LEADERBOARD_POLL_INTERVAL_MS);
}

function stopLeaderboardPolling() {
  if (!state.leaderboardPollHandle) return;
  clearInterval(state.leaderboardPollHandle);
  state.leaderboardPollHandle = null;
}

function showStatus(elementId, text, isError = false) {
  const el = byId(elementId);
  if (!el) return;
  el.textContent = text;
  el.classList.remove("success", "error");
  if (text) el.classList.add(isError ? "error" : "success");
}

function setSpinner(spinnerId, active) {
  const el = byId(spinnerId);
  if (!el) return;
  el.hidden = !active;
}

function setSyncText() {
  const now = Date.now();
  if (!state.lastSyncAt) return;
  const deltaSeconds = Math.max(0, Math.round((now - state.lastSyncAt) / 1000));
  const text = `Last synced ${deltaSeconds}s ago`;
  if (byId("live-sync")) byId("live-sync").textContent = text;
  if (byId("lobby-sync-chip")) byId("lobby-sync-chip").textContent = text;
  if (byId("leaderboard-sync")) byId("leaderboard-sync").textContent = text;
  if (byId("dashboard-sync-chip")) byId("dashboard-sync-chip").textContent = text;
}

function setAuthTab(tab) {
  state.activeAuthTab = tab;
  document.querySelectorAll(".tab").forEach((node) => {
    node.classList.toggle("active", node.dataset.authTab === tab);
  });
  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.toggle("active", form.id === `auth-${tab}`);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function saveAuthUser(user) {
  state.authUser = user;
  state.authToken = user?.token || null;
  state.authRole = user?.role || null;
  localStorage.setItem("qp_auth_user", JSON.stringify(user));
  updateTopbarUser();
}

function loadAuthUser() {
  const raw = localStorage.getItem("qp_auth_user");
  if (!raw) return;
  try {
    state.authUser = JSON.parse(raw);
    state.authToken = state.authUser?.token || null;
    state.authRole = state.authUser?.role || null;
  } catch {
    state.authUser = null;
    state.authToken = null;
    state.authRole = null;
  }
  updateTopbarUser();
}

function updateTopbarUser() {
  const roleSuffix = state.authRole ? ` (${state.authRole})` : "";
  byId("topbar-user-label").textContent = state.authUser?.name ? `${state.authUser.name}${roleSuffix}` : "Guest";
}

function saveProfileSettings() {
  const settings = {
    name: byId("profile-name").value.trim(),
    email: byId("profile-email").value.trim(),
    mode: byId("profile-mode").value,
    notify: byId("profile-notify").checked,
    twoFactor: byId("profile-2fa").checked,
  };

  if (!settings.name || !isValidEmail(settings.email)) {
    showStatus("profile-message", "Please provide valid name and email.", true);
    return;
  }

  localStorage.setItem("qp_profile_settings", JSON.stringify(settings));
  saveAuthUser({ name: settings.name, email: settings.email });
  showStatus("profile-message", "Settings saved successfully.");
}

function loadProfileSettings() {
  const raw = localStorage.getItem("qp_profile_settings");
  if (!raw) return;
  try {
    const settings = JSON.parse(raw);
    byId("profile-name").value = settings.name || "";
    byId("profile-email").value = settings.email || "";
    byId("profile-mode").value = settings.mode || "standard";
    byId("profile-notify").checked = Boolean(settings.notify);
    byId("profile-2fa").checked = Boolean(settings.twoFactor);
  } catch {
    // ignore malformed local storage
  }
}

function appendRuntimeSignal(message) {
  const feed = byId("dsa-runtime-feed");
  if (!feed) return;
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString()} — ${message}`;
  feed.prepend(item);
  const rows = Array.from(feed.querySelectorAll("li"));
  rows.slice(8).forEach((node) => node.remove());
}

function activateDsaCard(id, status) {
  const card = byId(id);
  if (!card) return;
  card.classList.add("active");
  const chip = card.querySelector(".chip");
  if (chip) chip.textContent = status;
  setTimeout(() => card.classList.remove("active"), 500);
}

function renderDashboard() {
  const list = byId("dashboard-past-quizzes");
  list.innerHTML = "";

  const history = JSON.parse(localStorage.getItem("qp_quiz_history") || "[]");
  if (!history.length) {
    byId("dashboard-empty").hidden = false;
  } else {
    byId("dashboard-empty").hidden = true;
    history.slice(-6).reverse().forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${entry.when} • Session ${entry.sessionId} • Avg ${entry.avg}`;
      list.appendChild(li);
    });
  }

  const graphHost = byId("dashboard-graph");
  graphHost.innerHTML = "";
  const values = history.slice(-8).map((item) => Number(item.avg));
  while (values.length < 8) values.unshift(Math.floor(Math.random() * 35) + 55);
  values.forEach((value) => {
    const bar = document.createElement("span");
    bar.style.height = `${Math.max(20, Math.min(100, value))}%`;
    graphHost.appendChild(bar);
  });
}

function storeQuizResult(sessionId, avg) {
  const history = JSON.parse(localStorage.getItem("qp_quiz_history") || "[]");
  history.push({
    sessionId,
    avg,
    when: new Date().toLocaleString(),
  });
  localStorage.setItem("qp_quiz_history", JSON.stringify(history));
}

async function createSession() {
  try {
    const title = byId("create-title").value.trim();
    const questionIds = parseQuestionIds(byId("create-questions").value);
    const questionDurationSeconds = Number(byId("create-duration").value || "12");

    byId("create-submit").disabled = true;
    setSpinner("create-spinner", true);

    const created = await api("/session/create", {
      method: "POST",
      body: JSON.stringify({ title, questionIds, questionDurationSeconds }),
    });

    state.role = "host";
    state.isHost = true;
    state.sessionId = created.sessionId;
    state.participantId = null;
    state.hiddenPlayers = new Set();
    state.lastLeaderboardRanks = {};

    byId("lobby-session").textContent = created.sessionId;
    byId("lobby-state").textContent = created.state;
    byId("host-controls").style.display = "flex";
    byId("kick-controls").hidden = false;

    showStatus("create-message", `Session created: ${created.sessionId}. Invite participants to lobby.`);
    showScreen("lobby");
    startSessionPolling("LOBBY");
    await loadSessionState();
  } catch (error) {
    showStatus("create-message", error.message, true);
  } finally {
    byId("create-submit").disabled = false;
    setSpinner("create-spinner", false);
  }
}

async function startDemoQuiz() {
  try {
    setSpinner("demo-spinner", true);
    const demo = await api("/demo/start");

    state.role = "host";
    state.isHost = true;
    state.sessionId = demo.sessionId;
    state.participantId = null;
    state.hiddenPlayers = new Set();
    state.lastLeaderboardRanks = {};

    byId("host-controls").style.display = "flex";
    byId("kick-controls").hidden = false;
    byId("lobby-session").textContent = demo.sessionId;
    byId("lobby-state").textContent = demo.state;

    renderPlayers(demo.players || []);
    showStatus("demo-message", demo.message || "Demo session ready.");

    showScreen("lobby");
    startSessionPolling("LOBBY");
    await loadSessionState();
  } catch (error) {
    showStatus("demo-message", error.message, true);
  } finally {
    setSpinner("demo-spinner", false);
  }
}

async function joinSession() {
  try {
    const sessionId = byId("join-session-id").value.trim();
    const participantName = byId("join-name").value.trim();

    if (!sessionId || !participantName) {
      showStatus("join-message", "Session ID and name are required.", true);
      return;
    }

    byId("join-submit").disabled = true;
    setSpinner("join-spinner", true);

    const joined = await api(`/session/join`, {
      method: "POST",
      body: JSON.stringify({ sessionId, participantName }),
    });

    state.role = "player";
    state.isHost = false;
    state.sessionId = joined.sessionId;
    state.participantId = joined.participantId;
    state.participantName = joined.participantName;
    state.lastLeaderboardRanks = {};

    byId("lobby-session").textContent = joined.sessionId;
    byId("lobby-state").textContent = joined.state;
    byId("host-controls").style.display = "none";
    byId("kick-controls").hidden = true;

    showStatus("join-message", `Joined as ${joined.participantName}. Waiting for host to start.`);

    showScreen("lobby");
    startSessionPolling("LOBBY");
    await loadSessionState();
  } catch (error) {
    showStatus("join-message", error.message, true);
  } finally {
    byId("join-submit").disabled = false;
    setSpinner("join-spinner", false);
  }
}

async function startSession() {
  try {
    await api(`/session/${encodeURIComponent(state.sessionId)}/question?start=true`);
    startSessionPolling("LIVE");
    await loadSessionState();
    appendRuntimeSignal("Session started → polling switched to LIVE mode");
  } catch (error) {
    showStatus("lobby-message", error.message, true);
  }
}

function endSession() {
  if (state.isHost && state.sessionId) {
    api(`/session/${encodeURIComponent(state.sessionId)}/end`, { method: "POST" }).catch(() => {
      // local fallback after best-effort backend end
    });
  }
  stopPolling();
  state.sessionId = null;
  state.participantId = null;
  state.currentQuestionId = null;
  state.lastLeaderboardSignature = "";
  state.lastLeaderboardRanks = {};
  showStatus("lobby-message", "Session closed locally. Start a new session from dashboard.");
  showScreen("dashboard");
}

async function kickSelectedPlayer() {
  const select = byId("kick-player-select");
  if (!select.value) {
    showStatus("lobby-message", "Select a participant to kick.", true);
    return;
  }
  try {
    await api(`/session/${encodeURIComponent(state.sessionId)}/participants/${encodeURIComponent(select.value)}/remove`, {
      method: "POST",
    });
    state.hiddenPlayers.add(select.value);
    showStatus("lobby-message", `${select.value} removed from session.`);
    await loadSessionState();
  } catch (error) {
    showStatus("lobby-message", error.message, true);
  }
}

function renderPlayers(players) {
  const filtered = players.filter((name) => !state.hiddenPlayers.has(name));

  const list = byId("lobby-players");
  list.innerHTML = "";

  byId("lobby-empty").hidden = filtered.length !== 0;
  byId("lobby-count").textContent = String(filtered.length);

  filtered.forEach((player, index) => {
    const item = document.createElement("li");
    const badge = index % 2 === 0 ? "ready" : "waiting";
    item.innerHTML = `<span>${player}</span><span class="player-badge">${badge}</span>`;
    list.appendChild(item);
  });

  const select = byId("kick-player-select");
  if (select) {
    select.innerHTML = "";
    filtered.forEach((player) => {
      const opt = document.createElement("option");
      opt.value = player;
      opt.textContent = player;
      select.appendChild(opt);
    });
  }
}

function animateQuestionTransition() {
  const card = byId("question-card");
  card.classList.remove("shift");
  void card.offsetWidth;
  card.classList.add("shift");
}

function renderQuestion(questionPayload) {
  byId("live-question").textContent = questionPayload.question.text;
  byId("live-index").textContent = String(questionPayload.questionIndex + 1);
  byId("live-total").textContent = String(questionPayload.totalQuestions);

  const timer = byId("live-timer");
  timer.textContent = `${questionPayload.remainingSeconds}s`;
  timer.classList.toggle("warning", questionPayload.remainingSeconds <= 5);
  timer.classList.remove("pulse");
  void timer.offsetWidth;
  timer.classList.add("pulse");

  if (state.currentQuestionId !== questionPayload.question.id) {
    state.currentQuestionId = questionPayload.question.id;
    state.selectedOption = null;
    showStatus("answer-status", "");
    animateQuestionTransition();
  }

  const optionsHost = byId("live-options");
  optionsHost.innerHTML = "";

  questionPayload.question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.disabled = state.isHost;

    if (state.selectedOption === index) button.classList.add("wrong");

    button.onclick = () => submitAnswer(index, button);
    optionsHost.appendChild(button);
  });
}

function renderLeaderboard(entries) {
  const signature = entries.map((entry) => `${entry.participantId}:${entry.score}`).join("|");
  const previousRanks = state.lastLeaderboardRanks || {};
  const nextRanks = {};

  [byId("live-leaderboard"), byId("leaderboard-full")].forEach((list) => {
    if (!list) return;
    list.innerHTML = "";

    entries.forEach((entry, index) => {
      const li = document.createElement("li");
      const previousRank = Number(previousRanks[entry.participantId] || index + 1);
      const delta = previousRank - (index + 1);
      const movement = delta > 0 ? ` ▲${delta}` : delta < 0 ? ` ▼${Math.abs(delta)}` : "";
      li.textContent = `#${index + 1} ${entry.participantName} — ${entry.score}${movement}`;

      if (index === 0) li.classList.add("top-1");
      if (index === 1) li.classList.add("top-2");
      if (index === 2) li.classList.add("top-3");
      if (state.lastLeaderboardSignature && state.lastLeaderboardSignature !== signature) {
        li.classList.add("bump");
        setTimeout(() => li.classList.remove("bump"), 260);
      }
      li.dataset.rank = String(index + 1);
      list.appendChild(li);
    });
  });

  entries.forEach((entry, index) => {
    nextRanks[entry.participantId] = index + 1;
  });
  state.lastLeaderboardRanks = nextRanks;
  state.lastLeaderboardSignature = signature;
}

async function manualLeaderboardRefresh(manual = true) {
  if (!state.sessionId || state.inFlightLeaderboard) return;

  try {
    state.inFlightLeaderboard = true;
    setSpinner("live-spinner", true);
    if (manual) byId("live-loading").textContent = "Updating leaderboard...";

    const data = await api(`/session/${encodeURIComponent(state.sessionId)}/leaderboard`);
    renderLeaderboard(data);
    byId("dsa-live-status").textContent = "Heap updated → leaderboard recalculated";
    activateDsaCard("dsa-heap", "active");
    appendRuntimeSignal("Heap updated → leaderboard recalculated");
  } finally {
    state.inFlightLeaderboard = false;
    setSpinner("live-spinner", false);
    if (manual) byId("live-loading").textContent = "";
  }
}

async function submitAnswer(answerOption, clickedButton) {
  if (!state.participantId || state.selectedOption !== null) return;

  try {
    const response = await api(`/session/${encodeURIComponent(state.sessionId)}/answer`, {
      method: "POST",
      body: JSON.stringify({ participantId: state.participantId, answerOption }),
    });

    state.selectedOption = answerOption;
    clickedButton.classList.add(response.isCorrect ? "correct" : "wrong");

    showStatus(
      "answer-status",
      response.isCorrect
        ? `Correct! Score: ${response.score}`
        : `Incorrect. Correct option: ${String.fromCharCode(65 + response.correctOption)}`,
      !response.isCorrect
    );

    appendRuntimeSignal(response.isCorrect ? "Submission accepted (correct)" : "Submission accepted (incorrect)");
    await manualLeaderboardRefresh(false);
  } catch (error) {
    showStatus("answer-status", error.message, true);
  }
}

function openLeaderboard() {
  showScreen("leaderboard");
  manualLeaderboardRefresh(false);
}

function backToLive() {
  showScreen("live");
}

function loadDsaInsights() {
  return api("/dsa/insights")
    .then((data) => {
      state.dsaInsights = data;
      activateDsaCard("dsa-bst", "ready");
      activateDsaCard("dsa-graph", "ready");
      activateDsaCard("dsa-dp", "ready");
      activateDsaCard("dsa-segment", "ready");

      const signals = data.runtimeSignals || [];
      if (signals.length) {
        appendRuntimeSignal(signals[0]);
      }
    })
    .catch(() => {
      // don't block flow for dsa visibility
    });
}

async function loadResults() {
  const data = await api(`/session/${encodeURIComponent(state.sessionId)}/results`);

  byId("result-session").textContent = state.sessionId;
  byId("result-range").textContent = String(data.totalScoreRange);
  byId("result-average").textContent = Number(data.averageScore || 0).toFixed(2);
  byId("result-difficulty").textContent = JSON.stringify(data.difficultyScoreBreakdown || {}, null, 2);
  byId("result-lis").textContent = JSON.stringify(data.lisPerformanceTrend, null, 2);

  const list = byId("result-leaderboard");
  list.innerHTML = "";
  const rank = data.rankByParticipant?.[state.participantId]
    ? `#${data.rankByParticipant[state.participantId]}`
    : "N/A";

  data.leaderboard.forEach((entry, idx) => {
    const li = document.createElement("li");
    li.textContent = `#${idx + 1} ${entry.participantName} — ${entry.score}`;
    if (idx === 0) li.classList.add("top-1");
    if (idx === 1) li.classList.add("top-2");
    if (idx === 2) li.classList.add("top-3");
    list.appendChild(li);
  });

  byId("result-rank").textContent = rank;
  byId("dsa-live-status").textContent = "Segment Tree queried + DP LIS computed for results";

  storeQuizResult(state.sessionId, Number(data.averageScore || 0).toFixed(2));
  renderDashboard();

  activateDsaCard("dsa-segment", "queried");
  activateDsaCard("dsa-dp", "computed");
  appendRuntimeSignal("Segment Tree queried + DP LIS computed for results");

  showScreen("results");
}

function showThankYou() {
  showScreen("thanks");
}

async function loadSessionState() {
  if (!state.sessionId || state.inFlightSession) return;

  try {
    state.inFlightSession = true;
    setSpinner("live-spinner", true);
    byId("live-loading").textContent = "Syncing live session...";
    byId("live-skeleton").hidden = false;

    const data = await api(`/session/${encodeURIComponent(state.sessionId)}/question`);
    state.lastSyncAt = Date.now();
    setSyncText();

    if (data.state === "LOBBY") {
      stopLeaderboardPolling();
      startSessionPolling("LOBBY");
      byId("lobby-state").textContent = data.state;
      renderPlayers(data.players || []);
      if (!byId("screen-lobby").classList.contains("active")) showScreen("lobby");
      return;
    }

    if (data.state === "LIVE") {
      startSessionPolling("LIVE");
      startLeaderboardPolling();

      if (!["live", "leaderboard"].some((name) => byId(`screen-${name}`).classList.contains("active"))) {
        showScreen("live");
      }

      renderQuestion(data);
      byId("dsa-live-status").textContent = "BST lookup → question rendered";
      activateDsaCard("dsa-bst", "active");
      appendRuntimeSignal("BST lookup → question rendered");
      if (!state.lastLeaderboardSignature) await manualLeaderboardRefresh(false);
      return;
    }

    if (data.state === "COMPLETED") {
      stopPolling();
      await loadResults();
      return;
    }

    showStatus("answer-status", "Session ended by host.", true);
    stopPolling();
    showScreen("dashboard");
  } catch (error) {
    showStatus("answer-status", error.message, true);
  } finally {
    state.inFlightSession = false;
    setSpinner("live-spinner", false);
    byId("live-skeleton").hidden = true;
    byId("live-loading").textContent = "";
  }
}

function bindNavigation() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.nav));
  });

  byId("nav-profile").addEventListener("click", () => showScreen("profile"));
  byId("home-start-demo").addEventListener("click", startDemoQuiz);
  byId("home-host").addEventListener("click", () => showScreen("create"));
  byId("home-join").addEventListener("click", () => showScreen("join"));

  byId("dashboard-start-host").addEventListener("click", () => showScreen("create"));
  byId("dashboard-demo").addEventListener("click", startDemoQuiz);
  byId("dashboard-join").addEventListener("click", () => showScreen("join"));

  byId("create-submit").addEventListener("click", createSession);
  byId("join-submit").addEventListener("click", joinSession);
  byId("start-session").addEventListener("click", startSession);
  byId("end-session").addEventListener("click", endSession);
  byId("kick-player").addEventListener("click", kickSelectedPlayer);

  byId("view-leaderboard").addEventListener("click", openLeaderboard);
  byId("manual-leaderboard").addEventListener("click", () => manualLeaderboardRefresh(true));
  byId("leaderboard-refresh").addEventListener("click", () => manualLeaderboardRefresh(true));
  byId("leaderboard-back").addEventListener("click", backToLive);

  byId("review-answers").addEventListener("click", async () => {
    try {
      const review = await api(`/session/${encodeURIComponent(state.sessionId)}/answers/review?questionIndex=0`);
      showStatus("result-message", `Review loaded (${review.answers?.length || 0} answers for question 1).`);
    } catch (error) {
      showStatus("result-message", error.message, true);
    }
  });
  byId("new-session").addEventListener("click", () => showScreen("create"));
  byId("finish-flow").addEventListener("click", showThankYou);
  byId("thanks-demo").addEventListener("click", startDemoQuiz);

  byId("save-profile").addEventListener("click", saveProfileSettings);
}

function bindAuthForms() {
  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => setAuthTab(button.dataset.authTab));
  });
  document.querySelectorAll("[data-auth-tab-link]").forEach((button) => {
    button.addEventListener("click", () => setAuthTab(button.dataset.authTabLink));
  });

  byId("auth-login").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = byId("login-email").value.trim();
    const password = byId("login-password").value.trim();
    if (!isValidEmail(email) || password.length < 8) {
      showStatus("login-message", "Enter valid credentials (email + min 8-char password).", true);
      return;
    }
    try {
      const auth = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveAuthUser({
        name: auth.name,
        email: auth.email,
        role: auth.role,
        userId: auth.userId,
        token: auth.accessToken,
      });
      showStatus("login-message", "Login successful. Redirecting to dashboard...");
      setTimeout(() => showScreen("dashboard"), 350);
    } catch (error) {
      showStatus("login-message", error.message, true);
    }
  });

  byId("auth-register").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = byId("register-name").value.trim();
    const email = byId("register-email").value.trim();
    const password = byId("register-password").value.trim();

    if (!name || !isValidEmail(email) || password.length < 8 || !/[0-9]/.test(password)) {
      showStatus("register-message", "Use valid name, email, and password with at least one number.", true);
      return;
    }

    try {
      const auth = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role: "HOST" }),
      });
      saveAuthUser({
        name: auth.name,
        email: auth.email,
        role: auth.role,
        userId: auth.userId,
        token: auth.accessToken,
      });
      byId("profile-name").value = name;
      byId("profile-email").value = email;
      showStatus("register-message", "Account created. Welcome aboard.");
      setTimeout(() => showScreen("dashboard"), 350);
    } catch (error) {
      showStatus("register-message", error.message, true);
    }
  });

  byId("auth-forgot").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = byId("forgot-email").value.trim();
    if (!isValidEmail(email)) {
      showStatus("forgot-message", "Enter a valid email to receive reset link.", true);
      return;
    }
    showStatus("forgot-message", "Reset link sent. Check your inbox in a few minutes.");
  });
}

function init() {
  loadAuthUser();
  loadProfileSettings();
  renderDashboard();
  bindNavigation();
  bindAuthForms();
  setAuthTab("login");
  loadDsaInsights();
  showScreen("home");

  setInterval(setSyncText, 1000);
}

init();
