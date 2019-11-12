BEGIN;

TRUNCATE
  users,
  comments,
  posts,
  groups,
  group_members
  RESTART IDENTITY CASCADE;

-- insert new user values
INSERT INTO users(user_name, full_name, email,  password)
VALUES
  -- muffun-stuff      email      blah@gmail.com
  ('dunder', 'Dunder Mifflin', 'blah@gmail.com', '$2a$12$3MsnYDHU0g.FBXkHU5qNiOVM/KT.2LXho7D6TZwbOKLFJBmSbHFbG'),
  -- boward-word      email,  bodoop@gmail.com
  ('b.deboop', 'Bodeep Deboop', 'bodoop@gmail.com', '$2a$12$nt8./ljTB2nPzcncvT51OOTl2AvWkDwQx0Fc70d8dB.VwKx.lKJRe'),
  -- charzard              email  personal
  ('c.bloggs', 'Charlie Bloggs', 'nathan.kinne@gmail.com', '$2a$12$I7iresCXsABro/2L1XnAaOKPIqxMHvyWG/YugMlqf4HYxODNMRzM6'),
  -- samword          samsmith@gmail.com
  ('s.smith', 'Sam Smith', 'samsmith@gmail.com', '$2a$12$qkJ4CkTXE5TzeplM5IUs4eVhkvUNm4/IE1H9jdPUPD2jPNSgpkRHq'),
  -- lex-password     email ataylor@gmail.com
  ('lexlor', 'Alex Taylor', 'ataylor@gmail.com', '$2a$12$9YDhqae2Hqt.w9io46C1fO/is48ebGbA0vRSX8xtHcVtX30TAPjd2'),
  -- ping-password            wippy@gmail.com
  ('wippy', 'Ping Won In', 'wippy@gmail.com', '$2a$12$/jAv6ITFFzjO4kaGUK6M5O2cy2OUv3hj8i0HnsPR4CPMCIdRrr5G6');

-- seeding the posts
INSERT INTO posts(post, user_id)
VALUES 
  ('How do I convert a string to an integer?', 1),
  ('How do I make json a string?', 2),
  ('Anyone interested in Java 8?', 3);

-- seed comments
INSERT INTO comments(comment,  post_id, user_id)
VALUES  
  ('Use parseInt()', 1, 3),
  ('Use JSON.stringify', 2, 1),
  ('Ew never. The GUI is terrible to work with.', 3, 1);

-- seed groups
INSERT INTO groups(group_name, about, exp_lvl)
VALUES
  ('JavaScript', 'Ask any question here in the javascript group', 'Everyone'),
  ('Java', 'Open to all questions regarding Java', 'Java 8 lovers'),
  ('Python', 'Welcome all lovers of the python', 'Advanced python');

-- insert posts and assign them to different groups
INSERT INTO posts(post, user_id, group_id)
VALUES 
  ('Why does everyone love Python?', 1, 3),
  ('Why does everyone love Java', 3, 2),
  ('Why does everyone love JavaScript?', 2, 1);

-- seed group members
INSERT INTO group_members(group_id, user_id)
VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (2, 1),
  (2, 3),
  (3, 2),
  (3, 1);

COMMIT;