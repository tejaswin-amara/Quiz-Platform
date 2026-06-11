-- BUG-FIX: Add indexes on frequently-queried columns that were missing from baseline.
--
-- players(session_id, user_id) is queried on every authenticated session request via
-- SessionService.requireSessionAccess() → existsBySessionIdAndUserId().
-- Without this index the table is full-scanned for each poll tick (every 2 s per client).
CREATE INDEX idx_players_session_user ON players(session_id, user_id);

-- results(participant_id) is queried when removing a participant and when showing per-participant
-- results; the existing composite index covers (session_id, question_index) but not participant_id alone.
CREATE INDEX idx_results_participant_id ON results(participant_id);

-- quiz_results(participant_id) for participant history queries.
CREATE INDEX idx_quiz_results_participant ON quiz_results(participant_id);
