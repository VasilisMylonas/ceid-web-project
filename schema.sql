CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE professors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    field VARCHAR(255) NOT NULL
);
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    description_path VARCHAR(255),
    -- NOT NULL on above
    professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE theses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    status VARCHAR(255) NOT NULL,
    cancellation_reason VARCHAR(255),
    protocol_number INTEGER,
    draft_path VARCHAR(255),
    nemertes_link VARCHAR(255)
);
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    thesis_id INTEGER REFERENCES theses(id) ON DELETE CASCADE,
    professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
    grade INTEGER CHECK (
        grade >= 0
        AND grade <= 10
    ),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transcript_path VARCHAR(255) NOT NULL
);
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    response VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    kind VARCHAR(255) NOT NULL,
    thesis_id INTEGER REFERENCES theses(id) ON DELETE CASCADE,
    link VARCHAR(255) NOT NULL
);
CREATE TABLE presentations (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    hall VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,
    thesis_id INTEGER REFERENCES theses(id) ON DELETE CASCADE
);
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content_path VARCHAR(255) NOT NULL,
    thesis_id INTEGER REFERENCES theses(id) ON DELETE CASCADE,
    professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE
);
