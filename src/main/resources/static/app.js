async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return response.json();
}

function pretty(target, data) {
  document.getElementById(target).textContent = JSON.stringify(data, null, 2);
}

async function createQuiz() {
  const title = document.getElementById("quizTitle").value;
  const questionIds = document.getElementById("quizQuestionIds").value
    .split(",")
    .map((idStr) => Number(idStr.trim()))
    .filter((parsedId) => !Number.isNaN(parsedId));

  const data = await api("/api/quizzes", {
    method: "POST",
    body: JSON.stringify({ title, questionIds }),
  });
  document.getElementById("quizCode").textContent = `Quiz Code: ${data.code}`;
}

async function joinQuiz() {
  const code = document.getElementById("joinCode").value;
  const participantName = document.getElementById("participantName").value;
  const data = await api(`/api/quizzes/${code}/join`, {
    method: "POST",
    body: JSON.stringify({ participantName }),
  });
  document.getElementById("participantId").textContent = `Participant ID: ${data.participantId}`;
}

async function submitQuiz() {
  const code = document.getElementById("submitCode").value;
  const participantId = document.getElementById("submitParticipantId").value;
  const answers = JSON.parse(document.getElementById("answers").value || "{}");
  const data = await api(`/api/quizzes/${code}/submit`, {
    method: "POST",
    body: JSON.stringify({ participantId, answers }),
  });
  pretty("scoreResult", data);
}

async function loadLeaderboard() {
  const code = document.getElementById("leaderboardCode").value;
  const data = await api(`/api/quizzes/${code}/leaderboard`);
  pretty("leaderboardResult", data);
}

async function recommend() {
  const topic = document.getElementById("recTopic").value;
  const mode = document.getElementById("recMode").value;
  const data = await api(`/api/recommendations?topic=${encodeURIComponent(topic)}&mode=${mode}`);
  pretty("recResult", data);
}

async function loadComplexities() {
  const data = await api("/api/complexities");
  pretty("complexityResult", data);
}
