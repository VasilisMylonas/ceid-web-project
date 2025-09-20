--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_committee_members_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_committee_members_role AS ENUM (
    'committee_member',
    'supervisor'
);


ALTER TYPE public.enum_committee_members_role OWNER TO postgres;

--
-- Name: enum_invitations_response; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_invitations_response AS ENUM (
    'pending',
    'accepted',
    'declined'
);


ALTER TYPE public.enum_invitations_response OWNER TO postgres;

--
-- Name: enum_presentations_kind; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_presentations_kind AS ENUM (
    'in_person',
    'online'
);


ALTER TYPE public.enum_presentations_kind OWNER TO postgres;

--
-- Name: enum_resources_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_resources_type AS ENUM (
    'document',
    'video',
    'image',
    'audio',
    'other'
);


ALTER TYPE public.enum_resources_type OWNER TO postgres;

--
-- Name: enum_theses_grading; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_theses_grading AS ENUM (
    'enabled',
    'disabled'
);


ALTER TYPE public.enum_theses_grading OWNER TO postgres;

--
-- Name: enum_theses_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_theses_status AS ENUM (
    'under_assignment',
    'active',
    'completed',
    'cancelled',
    'under_examination'
);


ALTER TYPE public.enum_theses_status OWNER TO postgres;

--
-- Name: enum_thesis_changes_new_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_thesis_changes_new_status AS ENUM (
    'under_assignment',
    'active',
    'completed',
    'cancelled',
    'under_examination'
);


ALTER TYPE public.enum_thesis_changes_new_status OWNER TO postgres;

--
-- Name: enum_thesis_changes_old_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_thesis_changes_old_status AS ENUM (
    'under_assignment',
    'active',
    'completed',
    'cancelled',
    'under_examination'
);


ALTER TYPE public.enum_thesis_changes_old_status OWNER TO postgres;

--
-- Name: enum_thesis_timeline_new_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_thesis_timeline_new_status AS ENUM (
    'under_assignment',
    'active',
    'completed',
    'cancelled',
    'under_examination'
);


ALTER TYPE public.enum_thesis_timeline_new_status OWNER TO postgres;

--
-- Name: enum_thesis_timeline_old_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_thesis_timeline_old_status AS ENUM (
    'under_assignment',
    'active',
    'completed',
    'cancelled',
    'under_examination'
);


ALTER TYPE public.enum_thesis_timeline_old_status OWNER TO postgres;

--
-- Name: enum_thesis_timelines_new_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_thesis_timelines_new_status AS ENUM (
    'under_assignment',
    'active',
    'completed',
    'cancelled',
    'under_examination',
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_thesis_timelines_new_status OWNER TO postgres;

--
-- Name: enum_thesis_timelines_old_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_thesis_timelines_old_status AS ENUM (
    'under_assignment',
    'active',
    'completed',
    'cancelled',
    'under_examination',
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_thesis_timelines_old_status OWNER TO postgres;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_role AS ENUM (
    'student',
    'professor',
    'secretary',
    'admin'
);


ALTER TYPE public.enum_users_role OWNER TO postgres;

--
-- Name: log_thesis_status_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_thesis_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO thesis_timeline (thesis_id, old_status, new_status, changed_at) VALUES (
    NEW.id,
    OLD.status,
    NEW.status,
    CURRENT_TIMESTAMP
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_thesis_status_change() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    thesis_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.announcements_id_seq OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: committee_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.committee_members (
    professor_id integer NOT NULL,
    thesis_id integer NOT NULL,
    role public.enum_committee_members_role DEFAULT 'committee_member'::public.enum_committee_members_role NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.committee_members OWNER TO postgres;

--
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    id integer NOT NULL,
    committee_member_id integer NOT NULL,
    objectives double precision NOT NULL,
    duration double precision NOT NULL,
    deliverable_quality double precision NOT NULL,
    presentation_quality double precision NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grades_id_seq OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitations (
    id integer NOT NULL,
    response public.enum_invitations_response DEFAULT 'pending'::public.enum_invitations_response NOT NULL,
    response_date timestamp with time zone,
    professor_id integer NOT NULL,
    thesis_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.invitations OWNER TO postgres;

--
-- Name: invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invitations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invitations_id_seq OWNER TO postgres;

--
-- Name: invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invitations_id_seq OWNED BY public.invitations.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    content text NOT NULL,
    thesis_id integer NOT NULL,
    professor_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.notes OWNER TO postgres;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notes_id_seq OWNER TO postgres;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: presentations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presentations (
    id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    link character varying(255),
    kind public.enum_presentations_kind NOT NULL,
    hall character varying(255),
    thesis_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.presentations OWNER TO postgres;

--
-- Name: presentations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.presentations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.presentations_id_seq OWNER TO postgres;

--
-- Name: presentations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.presentations_id_seq OWNED BY public.presentations.id;


--
-- Name: professors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professors (
    id integer NOT NULL,
    user_id integer NOT NULL,
    division character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.professors OWNER TO postgres;

--
-- Name: professors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.professors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.professors_id_seq OWNER TO postgres;

--
-- Name: professors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.professors_id_seq OWNED BY public.professors.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    link character varying(255) NOT NULL,
    type public.enum_resources_type DEFAULT 'other'::public.enum_resources_type NOT NULL,
    thesis_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.resources OWNER TO postgres;

--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.resources_id_seq OWNER TO postgres;

--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: secretaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secretaries (
    id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.secretaries OWNER TO postgres;

--
-- Name: secretaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.secretaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.secretaries_id_seq OWNER TO postgres;

--
-- Name: secretaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.secretaries_id_seq OWNED BY public.secretaries.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id integer NOT NULL,
    user_id integer NOT NULL,
    am character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.students_id_seq OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: theses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.theses (
    id integer NOT NULL,
    topic_id integer NOT NULL,
    student_id integer NOT NULL,
    document_file character varying(255),
    grade double precision,
    nemertes_link character varying(255),
    protocol_number character varying(255),
    start_date date,
    end_date date,
    assembly_number character varying(255),
    cancellation_reason character varying(255),
    status public.enum_theses_status DEFAULT 'under_assignment'::public.enum_theses_status NOT NULL,
    is_announced boolean DEFAULT false NOT NULL,
    grading public.enum_theses_grading DEFAULT 'disabled'::public.enum_theses_grading NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.theses OWNER TO postgres;

--
-- Name: theses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.theses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.theses_id_seq OWNER TO postgres;

--
-- Name: theses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.theses_id_seq OWNED BY public.theses.id;


--
-- Name: thesis_changes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thesis_changes (
    id integer NOT NULL,
    thesis_id integer NOT NULL,
    old_status public.enum_thesis_changes_old_status,
    new_status public.enum_thesis_changes_new_status NOT NULL,
    changed_at timestamp with time zone NOT NULL
);


ALTER TABLE public.thesis_changes OWNER TO postgres;

--
-- Name: thesis_changes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.thesis_changes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.thesis_changes_id_seq OWNER TO postgres;

--
-- Name: thesis_changes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.thesis_changes_id_seq OWNED BY public.thesis_changes.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    summary text NOT NULL,
    description_file character varying(255),
    professor_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.topics_id_seq OWNER TO postgres;

--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    address character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    landline_phone character varying(255),
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    role public.enum_users_role NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: invitations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations ALTER COLUMN id SET DEFAULT nextval('public.invitations_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: presentations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presentations ALTER COLUMN id SET DEFAULT nextval('public.presentations_id_seq'::regclass);


--
-- Name: professors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professors ALTER COLUMN id SET DEFAULT nextval('public.professors_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: secretaries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretaries ALTER COLUMN id SET DEFAULT nextval('public.secretaries_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: theses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theses ALTER COLUMN id SET DEFAULT nextval('public.theses_id_seq'::regclass);


--
-- Name: thesis_changes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis_changes ALTER COLUMN id SET DEFAULT nextval('public.thesis_changes_id_seq'::regclass);


--
-- Name: topics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: committee_members committee_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_pkey PRIMARY KEY (professor_id, thesis_id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: presentations presentations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presentations
    ADD CONSTRAINT presentations_pkey PRIMARY KEY (id);


--
-- Name: professors professors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professors
    ADD CONSTRAINT professors_pkey PRIMARY KEY (id);


--
-- Name: professors professors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professors
    ADD CONSTRAINT professors_user_id_key UNIQUE (user_id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: secretaries secretaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretaries
    ADD CONSTRAINT secretaries_pkey PRIMARY KEY (id);


--
-- Name: secretaries secretaries_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretaries
    ADD CONSTRAINT secretaries_user_id_key UNIQUE (user_id);


--
-- Name: students students_am_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_am_key UNIQUE (am);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_key UNIQUE (user_id);


--
-- Name: theses theses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theses
    ADD CONSTRAINT theses_pkey PRIMARY KEY (id);


--
-- Name: thesis_changes thesis_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis_changes
    ADD CONSTRAINT thesis_changes_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: committee_members_professor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX committee_members_professor_id ON public.committee_members USING btree (professor_id);


--
-- Name: committee_members_professor_id_thesis_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX committee_members_professor_id_thesis_id ON public.committee_members USING btree (professor_id, thesis_id);


--
-- Name: committee_members_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX committee_members_role ON public.committee_members USING btree (role);


--
-- Name: committee_members_thesis_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX committee_members_thesis_id ON public.committee_members USING btree (thesis_id);


--
-- Name: students_am; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX students_am ON public.students USING btree (am);


--
-- Name: students_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX students_user_id ON public.students USING btree (user_id);


--
-- Name: theses_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX theses_status ON public.theses USING btree (status);


--
-- Name: theses_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX theses_student_id ON public.theses USING btree (student_id);


--
-- Name: theses_topic_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX theses_topic_id ON public.theses USING btree (topic_id);


--
-- Name: topics_professor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX topics_professor_id ON public.topics USING btree (professor_id);


--
-- Name: topics_title; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX topics_title ON public.topics USING btree (title);


--
-- Name: users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email ON public.users USING btree (email);


--
-- Name: users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role ON public.users USING btree (role);


--
-- Name: users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username ON public.users USING btree (username);


--
-- Name: announcements announcements_thesis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES public.theses(id) ON UPDATE CASCADE;


--
-- Name: committee_members committee_members_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id) ON UPDATE CASCADE;


--
-- Name: committee_members committee_members_thesis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES public.theses(id) ON UPDATE CASCADE;


--
-- Name: invitations invitations_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id) ON UPDATE CASCADE;


--
-- Name: invitations invitations_thesis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES public.theses(id) ON UPDATE CASCADE;


--
-- Name: notes notes_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id) ON UPDATE CASCADE;


--
-- Name: notes notes_thesis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES public.theses(id) ON UPDATE CASCADE;


--
-- Name: presentations presentations_thesis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presentations
    ADD CONSTRAINT presentations_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES public.theses(id) ON UPDATE CASCADE;


--
-- Name: professors professors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professors
    ADD CONSTRAINT professors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: resources resources_thesis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES public.theses(id) ON UPDATE CASCADE;


--
-- Name: secretaries secretaries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretaries
    ADD CONSTRAINT secretaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: theses theses_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theses
    ADD CONSTRAINT theses_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: theses theses_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theses
    ADD CONSTRAINT theses_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON UPDATE CASCADE;


--
-- Name: thesis_changes thesis_changes_thesis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis_changes
    ADD CONSTRAINT thesis_changes_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES public.theses(id) ON UPDATE CASCADE;


--
-- Name: topics topics_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

