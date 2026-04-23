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
  dsaInsights: null,
};

const screens = ["home", "create", "join", "lobby", "live", "results", "thanks"];

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
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
  const interval = mode === "LIVE" ? 2000 : 3000;
  if (state.sessionPollHandle && state.pollMode === mode) {
    return;
  }
  if (state.sessionPollHandle) {
    clearInterval(state.sessionPollHandle);
  }
  state.pollMode = mode;
  state.sessionPollHandle = setInterval(loadSessionState, interval);
}

function startLeaderboardPolling() {
  if (state.leaderboardPollHandle) return;
  state.leaderboardPollHandle = setInterval(() => manualLeaderboardRefresh(false), 1500);
}

function stopLeaderboardPolling() {
  if (state.leaderboardPollHandle) {
    clearInterval(state.leaderboardPollHandle);
    state.leaderboardPollHandle = null;
  }
}

function showStatus(elementId, text, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.classList.remove("success", "error");
  if (text) {
    el.classList.add(isError ? "error" : "success");
  }
}

function setSpinner(spinnerId, active) {
  const el = document.getElementById(spinnerId);
  if (!el) return;
  el.hidden = !active;
}

async function loadComplexities() {
  const data = await api("/api/complexities");
  document.getElementById("complexity-output").textContent = JSON.stringify(data, null, 2);
}

function toggleDsaWorking() {
  const show = document.getElementById("dsa-working-toggle").checked;
  document.getElementById("insights-flow-wrapper").style.display = show ? "block" : "none";
  if (show && state.dsaInsights) {
    renderDsaInsights(state.dsaInsights);
  }
}

function renderDsaInsights(data) {
  state.dsaInsights = data;
  document.getElementById("insights-output").textContent = JSON.stringify(
    {
      questionFlow: data.questionFlow,
      leaderboardFlow: data.leaderboardFlow,
      recommendationFlow: data.recommendationFlow,
      optimizationFlow: data.optimizationFlow,
      analyticsFlow: data.analyticsFlow,
    },
    null,
    2
  );

  const working = document.getElementById("dsa-working-toggle").checked;
  if (!working) return;
  const diagram = data.workingDiagram || [];
  const signals = data.runtimeSignals || [];
  document.getElementById("insights-flow").textContent =
    `DSA Working Flow\n\n${diagram.map((line) => `• ${line}`).join("\n")}\n\nLive Signals\n${signals
      .map((line) => `• ${line}`)
      .join("\n")}`;
}

async function loadDsaInsights() {
  const data = await api("/dsa/insights");
  renderDsaInsights(data);
}

async function createSession() {
  try {
    const title = document.getElementById("create-title").value.trim();
    const questionIds = parseQuestionIds(document.getElementById("create-questions").value);
    const questionDurationSeconds = Number(document.getElementById("create-duration").value || "12");

    const createButton = document.querySelector("#screen-create button");
    createButton.disabled = true;
    setSpinner("create-spinner", true);
    const created = await api("/session/create", {
      method: "POST",
      body: JSON.stringify({ title, questionIds, questionDurationSeconds }),
    });
    createButton.disabled = false;
    setSpinner("create-spinner", false);

    state.role = "host";
    state.isHost = true;
    state.sessionId = created.sessionId;
    state.participantId = null;

    showStatus(
      "create-message",
      `Session created: ${created.sessionId}. Share this code and wait for players.`
    );

    document.getElementById("lobby-session").textContent = created.sessionId;
    document.getElementById("lobby-state").textContent = created.state;
    document.getElementById("host-controls").style.display = "flex";

    showScreen("lobby");
    startSessionPolling("LOBBY");
    await loadSessionState();
  } catch (error) {
    const createButton = document.querySelector("#screen-create button");
    if (createButton) createButton.disabled = false;
    setSpinner("create-spinner", false);
    showStatus("create-message", error.message, true);
  }
}

async function startDemoQuiz() {
  try {
    setSpinner("create-spinner", true);
    const demo = await api("/demo/start");
    state.role = "host";
    state.isHost = true;
    state.sessionId = demo.sessionId;
    state.participantId = null;
    document.getElementById("host-controls").style.display = "flex";
    document.getElementById("lobby-session").textContent = demo.sessionId;
    document.getElementById("lobby-state").textContent = demo.state;
    document.getElementById("lobby-count").textContent = String(demo.playerCount || 0);
    renderPlayers(demo.players || []);
    showStatus("demo-message", demo.message || "Demo session ready.");
    showScreen("lobby");
    startSessionPolling("LOBBY");
    await loadSessionState();
  } catch (error) {
    showStatus("demo-message", error.message, true);
  } finally {
    setSpinner("create-spinner", false);
  }
}

async function joinSession() {
  try {
    const sessionId = document.getElementById("join-session-id").value.trim();
    const participantName = document.getElementById("join-name").value.trim();
    const joinButton = document.querySelector("#screen-join button");
    joinButton.disabled = true;
    setSpinner("join-spinner", true);
    const joined = await api(`/session/join`, {
      method: "POST",
      body: JSON.stringify({ sessionId, participantName }),
    });
    joinButton.disabled = false;
    setSpinner("join-spinner", false);

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
    startSessionPolling("LOBBY");
    await loadSessionState();
  } catch (error) {
    const joinButton = document.querySelector("#screen-join button");
    if (joinButton) joinButton.disabled = false;
    setSpinner("join-spinner", false);
    showStatus("join-message", error.message, true);
  }
}

async function startSession() {
  try {
    await api(`/session/${encodeURIComponent(state.sessionId)}/question?start=true`);
    startSessionPolling("LIVE");
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
  timer.classList.remove("pulse");
  void timer.offsetWidth;
  timer.classList.add("pulse");

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
    if (index === 0) li.classList.add("top-1");
    if (index === 1) li.classList.add("top-2");
    if (index === 2) li.classList.add("top-3");
    if (state.lastLeaderboardSignature && state.lastLeaderboardSignature !== signature) {
      li.classList.add("bump");
      setTimeout(() => li.classList.remove("bump"), 260);
    }
    list.appendChild(li);
  });

  state.lastLeaderboardSignature = signature;
}

async function manualLeaderboardRefresh(manual = true) {
  if (!state.sessionId || state.inFlightLeaderboard) {
    return;
  }

  try {
    state.inFlightLeaderboard = true;
    setSpinner("live-spinner", true);
    if (manual) {
      document.getElementById("live-loading").textContent = "Updating leaderboard...";
    }
    const data = await api(`/session/${encodeURIComponent(state.sessionId)}/leaderboard`);
    renderLeaderboard(data);
    document.getElementById("dsa-live-status").textContent = "Heap updated → leaderboard recalculated";
  } finally {
    state.inFlightLeaderboard = false;
    setSpinner("live-spinner", false);
    if (manual) {
      document.getElementById("live-loading").textContent = "";
    }
  }
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
        : `Incorrect. Correct option: ${String.fromCharCode(65 + response.correctOption)}`,
      !response.isCorrect
    );

    await manualLeaderboardRefresh(false);
  } catch (error) {
    showStatus("answer-status", error.message, true);
  }
}

async function loadResults() {
  const data = await api(`/session/${encodeURIComponent(state.sessionId)}/results`);
  document.getElementById("result-session").textContent = state.sessionId;
  document.getElementById("result-range").textContent = String(data.totalScoreRange);
  document.getElementById("result-average").textContent = Number(data.averageScore || 0).toFixed(2);
  document.getElementById("result-difficulty").textContent = JSON.stringify(data.difficultyScoreBreakdown || {}, null, 2);
  document.getElementById("result-lis").textContent = JSON.stringify(data.lisPerformanceTrend, null, 2);

  const list = document.getElementById("result-leaderboard");
  list.innerHTML = "";
  let rank = data.rankByParticipant?.[state.participantId]
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
  document.getElementById("result-rank").textContent = rank;
  document.getElementById("dsa-live-status").textContent = "Segment Tree queried + DP LIS computed for results";

  showScreen("results");
}

function showThankYou() {
  showScreen("thanks");
}

async function loadSessionState() {
  if (!state.sessionId || state.inFlightSession) {
    return;
  }

  try {
    state.inFlightSession = true;
    setSpinner("live-spinner", true);
    document.getElementById("live-loading").textContent = "Syncing live session...";
    const data = await api(`/session/${encodeURIComponent(state.sessionId)}/question`);

    if (data.state === "LOBBY") {
      stopLeaderboardPolling();
      startSessionPolling("LOBBY");
      document.getElementById("lobby-state").textContent = data.state;
      document.getElementById("lobby-count").textContent = String(data.playerCount || 0);
      renderPlayers(data.players || []);
      if (document.getElementById("screen-lobby").classList.contains("active") === false) {
        showScreen("lobby");
      }
      return;
    }

    if (data.state === "LIVE") {
      startSessionPolling("LIVE");
      startLeaderboardPolling();
      showScreen("live");
      renderQuestion(data);
      document.getElementById("dsa-live-status").textContent = "BST lookup → question rendered";
      if (!state.lastLeaderboardSignature) {
        await manualLeaderboardRefresh(false);
      }
      return;
    }

    if (data.state === "COMPLETED") {
      stopPolling();
      await loadResults();
    }
  } catch (error) {
    showStatus("answer-status", error.message, true);
  } finally {
    state.inFlightSession = false;
    setSpinner("live-spinner", false);
    document.getElementById("live-loading").textContent = "";
  }
}

loadComplexities();
loadDsaInsights();
showScreen("home");
