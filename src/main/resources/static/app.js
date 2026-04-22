const state = {
  role: null,
  sessionId: null,
  participantId: null,
  participantName: null,
  isHost: false,
  currentQuestionId: null,
  selectedOption: null,
  pollHandle: null,
  lastLeaderboardSignature: "",
};

const screens = ["home", "create", "join", "lobby", "live", "results"];

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }
  return response.json();
}

function showScreen(name) {
  screens.forEach((screen) => {
    document.getElementById(`screen-${screen}`).classList.toggle("active", screen === name);
  });
}

function parseQuestionIds(raw) {
  return raw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((id) => !Number.isNaN(id));
}

function stopPolling() {
  if (state.pollHandle) {
    clearInterval(state.pollHandle);
    state.pollHandle = null;
  }
}

function startPolling() {
  stopPolling();
  state.pollHandle = setInterval(loadSessionState, 2500);
}

function showStatus(elementId, text, isError = false) {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.style.color = isError ? "#fca5a5" : "#cbd5e1";
}

async function loadComplexities() {
  const data = await api("/api/complexities");
  document.getElementById("complexity-output").textContent = JSON.stringify(data, null, 2);
}

async function createSession() {
  try {
    const title = document.getElementById("create-title").value.trim();
    const questionIds = parseQuestionIds(document.getElementById("create-questions").value);
    const questionDurationSeconds = Number(document.getElementById("create-duration").value || "12");

    const created = await api("/session/create", {
      method: "POST",
      body: JSON.stringify({ title, questionIds, questionDurationSeconds }),
    });

    state.role = "host";
    state.isHost = true;
    state.sessionId = created.sessionId;

    showStatus(
      "create-message",
      `Session created: ${created.sessionId}. Share this code and wait for players.`
    );

    document.getElementById("lobby-session").textContent = created.sessionId;
    document.getElementById("lobby-state").textContent = created.state;
    document.getElementById("host-controls").style.display = "flex";

    showScreen("lobby");
    startPolling();
    await loadSessionState();
  } catch (error) {
    showStatus("create-message", error.message, true);
  }
}

async function joinSession() {
  try {
    const sessionId = document.getElementById("join-session-id").value.trim();
    const participantName = document.getElementById("join-name").value.trim();
    const joined = await api(`/session/join?sessionId=${encodeURIComponent(sessionId)}`, {
      method: "POST",
      body: JSON.stringify({ participantName }),
    });

    state.role = "player";
    state.isHost = false;
    state.sessionId = joined.sessionId;
    state.participantId = joined.participantId;
    state.participantName = joined.participantName;

    document.getElementById("lobby-session").textContent = joined.sessionId;
    document.getElementById("lobby-state").textContent = joined.state;
    document.getElementById("host-controls").style.display = "none";

    showStatus("join-message", `Joined as ${joined.participantName}. Waiting for host to start...`);

    showScreen("lobby");
    startPolling();
    await loadSessionState();
  } catch (error) {
    showStatus("join-message", error.message, true);
  }
}

async function startSession() {
  try {
    await api(`/session/${encodeURIComponent(state.sessionId)}/question?start=true`);
    await loadSessionState();
  } catch (error) {
    showStatus("answer-status", error.message, true);
  }
}

function renderPlayers(players) {
  const list = document.getElementById("lobby-players");
  list.innerHTML = "";
  players.forEach((player) => {
    const item = document.createElement("li");
    item.textContent = player;
    list.appendChild(item);
  });
}

function renderQuestion(questionPayload) {
  document.getElementById("live-question").textContent = questionPayload.question.text;
  document.getElementById("live-index").textContent = String(questionPayload.questionIndex + 1);
  document.getElementById("live-total").textContent = String(questionPayload.totalQuestions);

  const timer = document.getElementById("live-timer");
  timer.textContent = `${questionPayload.remainingSeconds}s`;
  timer.classList.toggle("warning", questionPayload.remainingSeconds <= 5);

  if (state.currentQuestionId !== questionPayload.question.id) {
    state.currentQuestionId = questionPayload.question.id;
    state.selectedOption = null;
    showStatus("answer-status", "");
  }

  const optionsHost = document.getElementById("live-options");
  optionsHost.innerHTML = "";

  questionPayload.question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.disabled = state.isHost;

    if (state.selectedOption === index) {
      button.classList.add("wrong");
    }

    button.onclick = () => submitAnswer(index, button);
    optionsHost.appendChild(button);
  });
}

function renderLeaderboard(entries) {
  const list = document.getElementById("live-leaderboard");
  const signature = entries.map((entry) => `${entry.participantId}:${entry.score}`).join("|");

  list.innerHTML = "";
  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `#${index + 1} ${entry.participantName} — ${entry.score}`;
    if (state.lastLeaderboardSignature && state.lastLeaderboardSignature !== signature) {
      li.classList.add("bump");
      setTimeout(() => li.classList.remove("bump"), 260);
    }
    list.appendChild(li);
  });

  state.lastLeaderboardSignature = signature;
}

async function manualLeaderboardRefresh() {
  const data = await api(`/session/${encodeURIComponent(state.sessionId)}/leaderboard`);
  renderLeaderboard(data);
}

async function submitAnswer(answerOption, clickedButton) {
  if (!state.participantId || state.selectedOption !== null) {
    return;
  }

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
        : `Incorrect. Correct option: ${String.fromCharCode(65 + response.correctOption)}`
    );

    await manualLeaderboardRefresh();
  } catch (error) {
    showStatus("answer-status", error.message, true);
  }
}

async function loadResults() {
  const data = await api(`/session/${encodeURIComponent(state.sessionId)}/results`);
  document.getElementById("result-session").textContent = state.sessionId;
  document.getElementById("result-range").textContent = String(data.totalScoreRange);
  document.getElementById("result-lis").textContent = JSON.stringify(data.lisPerformanceTrend, null, 2);

  const list = document.getElementById("result-leaderboard");
  list.innerHTML = "";
  data.leaderboard.forEach((entry, idx) => {
    const li = document.createElement("li");
    li.textContent = `#${idx + 1} ${entry.participantName} — ${entry.score}`;
    list.appendChild(li);
  });

  showScreen("results");
}

async function loadSessionState() {
  if (!state.sessionId) {
    return;
  }

  try {
    const data = await api(`/session/${encodeURIComponent(state.sessionId)}/question`);

    if (data.state === "LOBBY") {
      document.getElementById("lobby-state").textContent = data.state;
      document.getElementById("lobby-count").textContent = String(data.playerCount || 0);
      renderPlayers(data.players || []);
      if (document.getElementById("screen-lobby").classList.contains("active") === false) {
        showScreen("lobby");
      }
      return;
    }

    if (data.state === "LIVE") {
      showScreen("live");
      renderQuestion(data);
      await manualLeaderboardRefresh();
      return;
    }

    if (data.state === "COMPLETED") {
      stopPolling();
      await loadResults();
    }
  } catch (error) {
    showStatus("answer-status", error.message, true);
  }
}

loadComplexities();
showScreen("home");
