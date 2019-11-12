CREATE TABLE group_members(
    id SERIAL PRIMARY KEY,
    group_id INTEGER
        REFERENCES groups(id)  ON DELETE CASCADE NOT NULL,
    user_id INTEGER
       REFERENCES users(id)  ON DELETE CASCADE NOT NULL
);