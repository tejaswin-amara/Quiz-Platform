ALTER TABLE players
    ADD CONSTRAINT uk_players_session_name UNIQUE (session_id, participant_name);
