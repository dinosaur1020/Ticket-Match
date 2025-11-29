--
-- PostgreSQL database dump
--

\restrict wMe4Kv4tDtMqv2jk7Zmlaw5yhkgGQh4MAPbj8EklesU6jCg0SWpSig8WfMX1RoV

-- Dumped from database version 17.7 (Postgres.app)
-- Dumped by pg_dump version 17.7 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: USER; Type: TABLE; Schema: public; Owner: dinoting
--

CREATE TABLE public."USER" (
    user_id character varying(20) NOT NULL,
    user_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    user_status character varying(20) DEFAULT 'Active'::character varying NOT NULL
);


ALTER TABLE public."USER" OWNER TO dinoting;

--
-- Name: event; Type: TABLE; Schema: public; Owner: dinoting
--

CREATE TABLE public.event (
    event_id character varying(20) NOT NULL,
    event_name character varying(100) NOT NULL,
    venue character varying(100)
);


ALTER TABLE public.event OWNER TO dinoting;

--
-- Name: event_time; Type: TABLE; Schema: public; Owner: dinoting
--

CREATE TABLE public.event_time (
    event_id character varying(20),
    event_time timestamp with time zone NOT NULL
);


ALTER TABLE public.event_time OWNER TO dinoting;

--
-- Name: listing; Type: TABLE; Schema: public; Owner: dinoting
--

CREATE TABLE public.listing (
    listing_id character varying(30) NOT NULL,
    owner_id character varying(20),
    event_id character varying(20),
    event_date date NOT NULL,
    content text,
    status character varying(20) DEFAULT 'Open'::character varying,
    type character varying(20)
);


ALTER TABLE public.listing OWNER TO dinoting;

--
-- Name: performer; Type: TABLE; Schema: public; Owner: dinoting
--

CREATE TABLE public.performer (
    event_id character varying(20) NOT NULL,
    performer character varying(50) NOT NULL
);


ALTER TABLE public.performer OWNER TO dinoting;

--
-- Name: ticket; Type: TABLE; Schema: public; Owner: dinoting
--

CREATE TABLE public.ticket (
    ticket_id character varying(30) NOT NULL,
    event_id character varying(20),
    owner_id character varying(20),
    seat_area character varying(30),
    seat_number character varying(30),
    price numeric,
    status character varying(20) DEFAULT 'Active'::character varying,
    listing_id character varying(30)
);


ALTER TABLE public.ticket OWNER TO dinoting;

--
-- Name: trade; Type: TABLE; Schema: public; Owner: dinoting
--

CREATE TABLE public.trade (
    trade_id character varying(30) NOT NULL,
    listing_id character varying(30),
    status character varying(20) DEFAULT 'Pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone,
    CONSTRAINT trade_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Completed'::character varying, 'Canceled'::character varying, 'Disputed'::character varying])::text[])))
);


ALTER TABLE public.trade OWNER TO dinoting;

--
-- Name: trade_participant; Type: TABLE; Schema: public; Owner: dinoting
--

CREATE TABLE public.trade_participant (
    trade_id character varying(30) NOT NULL,
    user_id character varying(20) NOT NULL,
    role character varying(20),
    confirmed boolean DEFAULT false,
    confirmed_at timestamp with time zone,
    CONSTRAINT trade_participant_role_check CHECK (((role)::text = ANY ((ARRAY['Buyer'::character varying, 'Seller'::character varying, 'Exchanger'::character varying])::text[])))
);


ALTER TABLE public.trade_participant OWNER TO dinoting;

--
-- Name: trade_ticket; Type: TABLE; Schema: public; Owner: dinoting
--

CREATE TABLE public.trade_ticket (
    trade_id character varying(30) NOT NULL,
    ticket_id character varying(30) NOT NULL,
    from_user_id character varying(20),
    to_user_id character varying(20)
);


ALTER TABLE public.trade_ticket OWNER TO dinoting;

--
-- Name: user_role; Type: TABLE; Schema: public; Owner: dinoting
--

CREATE TABLE public.user_role (
    user_id character varying(20) NOT NULL,
    role character varying(20) NOT NULL
);


ALTER TABLE public.user_role OWNER TO dinoting;

--
-- Data for Name: USER; Type: TABLE DATA; Schema: public; Owner: dinoting
--

COPY public."USER" (user_id, user_name, email, password, user_status) FROM stdin;
USR001	John Smith	john.smith@email.com	$2b$10$hashedpassword1	Active
USR002	Sarah Johnson	sarah.johnson@email.com	$2b$10$hashedpassword2	Active
USR003	Mike Chen	mike.chen@email.com	$2b$10$hashedpassword3	Active
USR004	Emma Davis	emma.davis@email.com	$2b$10$hashedpassword4	Active
USR005	Alex Rodriguez	alex.rodriguez@email.com	$2b$10$hashedpassword5	Active
USR006	Lisa Wang	lisa.wang@email.com	$2b$10$hashedpassword6	Active
USR007	David Brown	david.brown@email.com	$2b$10$hashedpassword7	Active
USR008	Maria Garcia	maria.garcia@email.com	$2b$10$hashedpassword8	Active
USR675499	Dino Ting	dino.ting1020@gmail.com	123456	Active
\.


--
-- Data for Name: event; Type: TABLE DATA; Schema: public; Owner: dinoting
--

COPY public.event (event_id, event_name, venue) FROM stdin;
EVT001	Taylor Swift - Eras Tour	SoFi Stadium
EVT002	Los Angeles Lakers vs Golden State Warriors	Crypto.com Arena
EVT003	Metallica World Tour	Hollywood Bowl
EVT004	Hamilton: An American Musical	Ahmanson Theatre
EVT005	Coachella Music Festival	Empire Polo Club
EVT006	Los Angeles Dodgers vs San Francisco Giants	Dodger Stadium
\.


--
-- Data for Name: event_time; Type: TABLE DATA; Schema: public; Owner: dinoting
--

COPY public.event_time (event_id, event_time) FROM stdin;
EVT001	2025-03-16 03:00:00+08
EVT001	2025-03-17 03:00:00+08
EVT002	2025-02-21 03:30:00+08
EVT003	2025-04-11 04:00:00+08
EVT004	2025-03-06 04:00:00+08
EVT004	2025-03-07 04:00:00+08
EVT005	2025-04-12 20:00:00+08
EVT005	2025-04-13 20:00:00+08
EVT006	2025-05-02 03:10:00+08
EVT001	2026-03-16 03:00:00+08
EVT001	2026-03-17 03:00:00+08
EVT002	2026-02-21 03:30:00+08
EVT003	2026-04-11 04:00:00+08
EVT004	2026-03-06 04:00:00+08
EVT004	2026-03-07 04:00:00+08
EVT005	2026-04-12 20:00:00+08
EVT005	2026-04-13 20:00:00+08
EVT006	2026-05-02 03:10:00+08
\.


--
-- Data for Name: listing; Type: TABLE DATA; Schema: public; Owner: dinoting
--

COPY public.listing (listing_id, owner_id, event_id, event_date, content, status, type) FROM stdin;
LST001	USR002	EVT001	2026-03-15	Looking for floor seats near stage	Open	Wanted
LST002	USR004	EVT001	2026-03-16	Have 2 premium seats to trade for different date	Open	Trade
LST003	USR005	EVT002	2026-02-20	Selling 4 center court tickets	Open	Sale
LST004	USR007	EVT003	2026-04-10	Premium pavilion seats available	Open	Sale
LST005	USR002	EVT004	2026-03-05	Need orchestra seats for Hamilton	Open	Wanted
LST006	USR008	EVT005	2026-04-12	Weekend pass for Coachella	Open	Sale
LST007	USR003	EVT006	2026-05-01	Field level tickets to trade	Open	Trade
\.


--
-- Data for Name: performer; Type: TABLE DATA; Schema: public; Owner: dinoting
--

COPY public.performer (event_id, performer) FROM stdin;
EVT001	Taylor Swift
EVT002	Los Angeles Lakers
EVT002	Golden State Warriors
EVT003	Metallica
EVT004	Hamilton Cast
EVT005	Various Artists
EVT005	Lana Del Rey
EVT005	Harry Styles
EVT006	Los Angeles Dodgers
EVT006	San Francisco Giants
\.


--
-- Data for Name: ticket; Type: TABLE DATA; Schema: public; Owner: dinoting
--

COPY public.ticket (ticket_id, event_id, owner_id, seat_area, seat_number, price, status, listing_id) FROM stdin;
TKT001	EVT001	USR002	Floor	A1-A2	450	Active	LST002
TKT002	EVT001	USR002	Floor	A3-A4	450	Active	LST002
TKT003	EVT002	USR005	Center Court	101-104	280	Active	LST003
TKT004	EVT002	USR005	Center Court	105-108	280	Active	LST003
TKT005	EVT003	USR007	Pavilion	B12-B13	120	Active	LST004
TKT006	EVT005	USR008	General Admission	GA-001	450	Active	LST006
TKT007	EVT006	USR003	Field Level	12-13	180	Active	LST007
TKT008	EVT004	USR001	Orchestra	O15	\N	Active	\N
TKT009	EVT001	USR004	Mezzanine	M5-M6	320	Active	\N
TKT010	EVT003	USR006	Lawn	LA-45	75	Active	\N
\.


--
-- Data for Name: trade; Type: TABLE DATA; Schema: public; Owner: dinoting
--

COPY public.trade (trade_id, listing_id, status, created_at, updated_at) FROM stdin;
TRD001	LST003	Pending	2025-01-15 18:30:00+08	\N
TRD002	LST007	Completed	2025-01-10 22:20:00+08	2025-01-13 00:45:00+08
TRD003	LST002	Pending	2025-01-20 17:15:00+08	\N
trade-1764331030786	LST002	Pending	2025-11-28 19:57:15.804653+08	\N
trade-1764331040955	LST002	Pending	2025-11-28 19:57:21.247288+08	\N
trade-1764331040954	LST002	Pending	2025-11-28 19:57:21.247596+08	\N
trade-1764331705194	LST003	Pending	2025-11-28 20:08:25.220331+08	\N
\.


--
-- Data for Name: trade_participant; Type: TABLE DATA; Schema: public; Owner: dinoting
--

COPY public.trade_participant (trade_id, user_id, role, confirmed, confirmed_at) FROM stdin;
TRD001	USR005	Seller	t	2025-01-15 18:35:00+08
TRD001	USR001	Buyer	f	\N
TRD002	USR003	Exchanger	t	2025-01-10 22:25:00+08
TRD002	USR007	Exchanger	t	2025-01-11 19:30:00+08
TRD003	USR002	Seller	t	2025-01-20 17:20:00+08
TRD003	USR006	Buyer	f	\N
trade-1764331030786	USR675499	Buyer	f	\N
trade-1764331030786	USR004	Seller	f	\N
trade-1764331040954	USR675499	Buyer	f	\N
trade-1764331040955	USR675499	Buyer	f	\N
trade-1764331040954	USR004	Seller	f	\N
trade-1764331040955	USR004	Seller	f	\N
trade-1764331705194	USR005	Seller	f	\N
trade-1764331705194	USR675499	Buyer	t	2025-11-28 20:08:40.358137+08
\.


--
-- Data for Name: trade_ticket; Type: TABLE DATA; Schema: public; Owner: dinoting
--

COPY public.trade_ticket (trade_id, ticket_id, from_user_id, to_user_id) FROM stdin;
TRD001	TKT003	USR005	USR001
TRD001	TKT004	USR005	USR001
TRD002	TKT007	USR003	USR007
TRD003	TKT001	USR002	USR006
TRD003	TKT002	USR002	USR006
trade-1764331030786	TKT001	USR004	USR675499
trade-1764331030786	TKT002	USR004	USR675499
trade-1764331040954	TKT001	USR004	USR675499
trade-1764331040955	TKT001	USR004	USR675499
trade-1764331040954	TKT002	USR004	USR675499
trade-1764331040955	TKT002	USR004	USR675499
trade-1764331705194	TKT003	USR005	USR675499
trade-1764331705194	TKT004	USR005	USR675499
\.


--
-- Data for Name: user_role; Type: TABLE DATA; Schema: public; Owner: dinoting
--

COPY public.user_role (user_id, role) FROM stdin;
USR001	Buyer
USR001	Seller
USR002	Seller
USR002	Exchanger
USR003	Buyer
USR003	Exchanger
USR004	Seller
USR005	Buyer
USR005	Seller
USR005	Exchanger
USR006	Buyer
USR007	Seller
USR007	Exchanger
USR008	Buyer
USR008	Seller
USR675499	User
\.


--
-- Name: USER USER_email_key; Type: CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public."USER"
    ADD CONSTRAINT "USER_email_key" UNIQUE (email);


--
-- Name: USER USER_pkey; Type: CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public."USER"
    ADD CONSTRAINT "USER_pkey" PRIMARY KEY (user_id);


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (event_id);


--
-- Name: listing listing_pkey; Type: CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_pkey PRIMARY KEY (listing_id);


--
-- Name: performer performer_pkey; Type: CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.performer
    ADD CONSTRAINT performer_pkey PRIMARY KEY (event_id, performer);


--
-- Name: ticket ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_pkey PRIMARY KEY (ticket_id);


--
-- Name: trade_participant trade_participant_pkey; Type: CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.trade_participant
    ADD CONSTRAINT trade_participant_pkey PRIMARY KEY (trade_id, user_id);


--
-- Name: trade trade_pkey; Type: CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT trade_pkey PRIMARY KEY (trade_id);


--
-- Name: trade_ticket trade_ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.trade_ticket
    ADD CONSTRAINT trade_ticket_pkey PRIMARY KEY (trade_id, ticket_id);


--
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (user_id, role);


--
-- Name: idx_listing_event; Type: INDEX; Schema: public; Owner: dinoting
--

CREATE INDEX idx_listing_event ON public.listing USING btree (event_id);


--
-- Name: idx_ticket_owner; Type: INDEX; Schema: public; Owner: dinoting
--

CREATE INDEX idx_ticket_owner ON public.ticket USING btree (owner_id);


--
-- Name: idx_trade_listing; Type: INDEX; Schema: public; Owner: dinoting
--

CREATE INDEX idx_trade_listing ON public.trade USING btree (listing_id);


--
-- Name: idx_trade_ticket_ticket; Type: INDEX; Schema: public; Owner: dinoting
--

CREATE INDEX idx_trade_ticket_ticket ON public.trade_ticket USING btree (ticket_id);


--
-- Name: event_time event_time_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.event_time
    ADD CONSTRAINT event_time_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id);


--
-- Name: listing listing_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id);


--
-- Name: listing listing_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public."USER"(user_id);


--
-- Name: performer performer_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.performer
    ADD CONSTRAINT performer_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id);


--
-- Name: ticket ticket_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id);


--
-- Name: ticket ticket_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listing(listing_id);


--
-- Name: ticket ticket_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public."USER"(user_id);


--
-- Name: trade trade_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT trade_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listing(listing_id);


--
-- Name: trade_participant trade_participant_trade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.trade_participant
    ADD CONSTRAINT trade_participant_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES public.trade(trade_id) ON DELETE CASCADE;


--
-- Name: trade_participant trade_participant_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.trade_participant
    ADD CONSTRAINT trade_participant_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."USER"(user_id);


--
-- Name: trade_ticket trade_ticket_from_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.trade_ticket
    ADD CONSTRAINT trade_ticket_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public."USER"(user_id);


--
-- Name: trade_ticket trade_ticket_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.trade_ticket
    ADD CONSTRAINT trade_ticket_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.ticket(ticket_id);


--
-- Name: trade_ticket trade_ticket_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.trade_ticket
    ADD CONSTRAINT trade_ticket_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public."USER"(user_id);


--
-- Name: trade_ticket trade_ticket_trade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.trade_ticket
    ADD CONSTRAINT trade_ticket_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES public.trade(trade_id) ON DELETE CASCADE;


--
-- Name: user_role user_role_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dinoting
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."USER"(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict wMe4Kv4tDtMqv2jk7Zmlaw5yhkgGQh4MAPbj8EklesU6jCg0SWpSig8WfMX1RoV

