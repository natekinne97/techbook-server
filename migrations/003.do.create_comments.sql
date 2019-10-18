CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT now(),
    user_id INTEGER
        REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    post_id INTEGER
        REFERENCES posts(id) ON DELETE CASCADE NOT NULL
);