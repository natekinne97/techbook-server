-- // post_id, users_id, up_or down

CREATE TABLE voted(
    id SERIAL PRIMARY KEY,
    vote INTEGER,
    post_id INTEGER
        REFERENCES posts(id)  ON DELETE CASCADE NOT NULL,
    user_id INTEGER
       REFERENCES users(id)  ON DELETE CASCADE NOT NULL
);