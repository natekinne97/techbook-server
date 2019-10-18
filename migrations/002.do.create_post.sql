-- for now we will not include groups or group id or rating.
CREATE TABLE posts(
    id SERIAL PRIMARY KEY,
    post TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT now(),
    user_id INTEGER
        REFERENCES users(id)  ON DELETE CASCADE NOT NULL
);