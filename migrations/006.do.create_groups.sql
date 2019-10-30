CREATE TABLE groups(
    id SERIAL PRIMARY KEY,
    group_name TEXT NOT NULL UNIQUE,
    about TEXT NOT NULL,
    exp_lvl TEXT NOT NULL
);