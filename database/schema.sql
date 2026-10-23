-- Do an tot nghiep: He thong hoc tap truc tuyen tich hop RAG
-- He quan tri: MySQL 8.0+
-- File nay chi tao database va cau truc bang, khong tao tai khoan ung dung.

CREATE DATABASE IF NOT EXISTS datn_learning
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE datn_learning;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  status ENUM('active', 'locked', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  refresh_token_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  replaced_by_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_refresh_tokens_user_status (user_id, revoked_at, expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS courses (
  course_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  instructor_id BIGINT UNSIGNED NULL,
  course_code VARCHAR(40) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_courses_code UNIQUE (course_code),
  CONSTRAINT fk_courses_instructor
    FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  CONSTRAINT uq_enrollments_course_student UNIQUE (course_id, student_id),
  CONSTRAINT fk_enrollments_course
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_student
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_enrollments_student_status (student_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS topics (
  topic_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  slug VARCHAR(100) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_topics_course_slug UNIQUE (course_id, slug),
  CONSTRAINT uq_topics_course_order UNIQUE (course_id, sort_order),
  CONSTRAINT fk_topics_course
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lessons (
  lesson_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  topic_id BIGINT UNSIGNED NULL,
  slug VARCHAR(120) NOT NULL,
  title VARCHAR(180) NOT NULL,
  content LONGTEXT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_lessons_course_slug UNIQUE (course_id, slug),
  CONSTRAINT fk_lessons_course
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_lessons_topic
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE SET NULL,
  INDEX idx_lessons_course_order (course_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documents (
  document_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NULL,
  topic_id BIGINT UNSIGNED NULL,
  uploaded_by BIGINT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  source_path VARCHAR(500) NOT NULL,
  file_type ENUM('text', 'pdf') NOT NULL,
  checksum_sha256 CHAR(64) NULL,
  indexing_status ENUM('pending', 'processing', 'indexed', 'failed') NOT NULL DEFAULT 'pending',
  indexing_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_course
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_lesson
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_topic
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_uploader
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_documents_scope (course_id, topic_id, indexing_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document_chunks (
  chunk_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT UNSIGNED NOT NULL,
  vector_store_key VARCHAR(191) NOT NULL,
  heading VARCHAR(255) NULL,
  chunk_index INT UNSIGNED NOT NULL,
  content LONGTEXT NOT NULL,
  token_count INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_chunks_vector_key UNIQUE (vector_store_key),
  CONSTRAINT uq_chunks_document_index UNIQUE (document_id, chunk_index),
  CONSTRAINT fk_chunks_document
    FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS question_bank (
  question_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  topic_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  source_document_id BIGINT UNSIGNED NULL,
  question_type ENUM('multiple_choice', 'true_false', 'short_answer') NOT NULL DEFAULT 'multiple_choice',
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NULL,
  status ENUM('draft', 'approved', 'inactive') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_questions_topic
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE CASCADE,
  CONSTRAINT fk_questions_creator
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_questions_source
    FOREIGN KEY (source_document_id) REFERENCES documents(document_id) ON DELETE SET NULL,
  INDEX idx_questions_topic_difficulty (topic_id, difficulty, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS question_options (
  option_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_id BIGINT UNSIGNED NOT NULL,
  option_label CHAR(1) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_options_question_label UNIQUE (question_id, option_label),
  CONSTRAINT fk_options_question
    FOREIGN KEY (question_id) REFERENCES question_bank(question_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quizzes (
  quiz_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  time_limit_minutes SMALLINT UNSIGNED NULL,
  max_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_quizzes_course
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_quizzes_creator
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_questions (
  quiz_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL,
  points DECIMAL(6,2) NOT NULL DEFAULT 1.00,
  PRIMARY KEY (quiz_id, question_id),
  CONSTRAINT uq_quiz_questions_order UNIQUE (quiz_id, sort_order),
  CONSTRAINT fk_quiz_questions_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_questions_question
    FOREIGN KEY (question_id) REFERENCES question_bank(question_id) ON DELETE RESTRICT,
  CONSTRAINT chk_quiz_question_points CHECK (points > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_attempts (
  attempt_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quiz_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  attempt_number SMALLINT UNSIGNED NOT NULL,
  status ENUM('in_progress', 'submitted', 'graded') NOT NULL DEFAULT 'in_progress',
  score DECIMAL(7,2) NULL,
  max_score DECIMAL(7,2) NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME NULL,
  CONSTRAINT uq_attempts_quiz_student_number UNIQUE (quiz_id, student_id, attempt_number),
  CONSTRAINT fk_attempts_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  CONSTRAINT fk_attempts_student
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_attempts_student_time (student_id, submitted_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attempt_answers (
  answer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  attempt_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  selected_option_id BIGINT UNSIGNED NULL,
  answer_text TEXT NULL,
  is_correct BOOLEAN NULL,
  awarded_points DECIMAL(6,2) NULL,
  answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_answers_attempt_question UNIQUE (attempt_id, question_id),
  CONSTRAINT fk_answers_attempt
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question
    FOREIGN KEY (question_id) REFERENCES question_bank(question_id) ON DELETE RESTRICT,
  CONSTRAINT fk_answers_option
    FOREIGN KEY (selected_option_id) REFERENCES question_options(option_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS learning_progress (
  progress_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NOT NULL,
  progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  first_opened_at DATETIME NULL,
  last_accessed_at DATETIME NULL,
  completed_at DATETIME NULL,
  CONSTRAINT uq_progress_student_lesson UNIQUE (student_id, lesson_id),
  CONSTRAINT fk_progress_student
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_lesson
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  CONSTRAINT chk_progress_percent CHECK (progress_percent BETWEEN 0 AND 100)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS topic_mastery (
  mastery_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  topic_id BIGINT UNSIGNED NOT NULL,
  accuracy_component DECIMAL(5,4) NOT NULL DEFAULT 0,
  difficulty_component DECIMAL(5,4) NOT NULL DEFAULT 0,
  repetition_component DECIMAL(5,4) NOT NULL DEFAULT 0,
  history_component DECIMAL(5,4) NOT NULL DEFAULT 0,
  time_component DECIMAL(5,4) NOT NULL DEFAULT 0,
  mastery_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  classification ENUM('urgent_review', 'reinforce', 'achieved', 'mastered') NOT NULL DEFAULT 'urgent_review',
  calculated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_mastery_student_topic UNIQUE (student_id, topic_id),
  CONSTRAINT fk_mastery_student
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_mastery_topic
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE CASCADE,
  CONSTRAINT chk_mastery_score CHECK (mastery_score BETWEEN 0 AND 100),
  INDEX idx_mastery_student_score (student_id, mastery_score)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS review_recommendations (
  recommendation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  topic_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NULL,
  priority_score DECIMAL(7,4) NOT NULL,
  reason VARCHAR(500) NOT NULL,
  status ENUM('pending', 'viewed', 'completed', 'dismissed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  CONSTRAINT fk_recommendations_student
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_recommendations_topic
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE CASCADE,
  CONSTRAINT fk_recommendations_lesson
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE SET NULL,
  INDEX idx_recommendations_student_priority (student_id, status, priority_score)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rag_queries (
  rag_query_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NULL,
  topic_id BIGINT UNSIGNED NULL,
  question TEXT NOT NULL,
  answer LONGTEXT NULL,
  answer_mode ENUM('llm_rag', 'extractive_fallback', 'no_context', 'error') NOT NULL,
  model_name VARCHAR(120) NULL,
  response_time_ms INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rag_queries_student
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_rag_queries_course
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_rag_queries_lesson
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE SET NULL,
  CONSTRAINT fk_rag_queries_topic
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE SET NULL,
  INDEX idx_rag_queries_course_time (course_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rag_retrievals (
  rag_retrieval_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rag_query_id BIGINT UNSIGNED NOT NULL,
  chunk_id BIGINT UNSIGNED NOT NULL,
  result_position SMALLINT UNSIGNED NOT NULL,
  similarity_score DECIMAL(8,6) NOT NULL,
  CONSTRAINT uq_rag_retrieval_position UNIQUE (rag_query_id, result_position),
  CONSTRAINT fk_rag_retrieval_query
    FOREIGN KEY (rag_query_id) REFERENCES rag_queries(rag_query_id) ON DELETE CASCADE,
  CONSTRAINT fk_rag_retrieval_chunk
    FOREIGN KEY (chunk_id) REFERENCES document_chunks(chunk_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rag_experiments (
  experiment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  experiment_name VARCHAR(180) NOT NULL,
  dataset_name VARCHAR(100) NOT NULL,
  embedding_model VARCHAR(120) NOT NULL,
  llm_model VARCHAR(120) NOT NULL,
  configuration JSON NOT NULL,
  status ENUM('running', 'completed', 'failed') NOT NULL DEFAULT 'running',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rag_experiment_results (
  experiment_result_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  experiment_id BIGINT UNSIGNED NOT NULL,
  test_id VARCHAR(40) NOT NULL,
  mode ENUM('baseline', 'rag') NOT NULL,
  question TEXT NOT NULL,
  generated_answer LONGTEXT NOT NULL,
  gold_answer TEXT NOT NULL,
  gold_source VARCHAR(500) NOT NULL,
  retrieved_sources JSON NULL,
  response_time_ms INT UNSIGNED NOT NULL,
  token_f1 DECIMAL(7,6) NULL,
  groundedness DECIMAL(7,6) NULL,
  manual_correctness TINYINT UNSIGNED NULL,
  manual_groundedness TINYINT UNSIGNED NULL,
  manual_completeness TINYINT UNSIGNED NULL,
  manual_note TEXT NULL,
  CONSTRAINT uq_experiment_result UNIQUE (experiment_id, test_id, mode),
  CONSTRAINT fk_experiment_results_experiment
    FOREIGN KEY (experiment_id) REFERENCES rag_experiments(experiment_id) ON DELETE CASCADE,
  CONSTRAINT chk_manual_correctness CHECK (manual_correctness IS NULL OR manual_correctness BETWEEN 0 AND 2),
  CONSTRAINT chk_manual_groundedness CHECK (manual_groundedness IS NULL OR manual_groundedness BETWEEN 0 AND 2),
  CONSTRAINT chk_manual_completeness CHECK (manual_completeness IS NULL OR manual_completeness BETWEEN 0 AND 2)
) ENGINE=InnoDB;
