CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  role varchar(20) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN','MEMBER')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE resource_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL UNIQUE
);
CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id uuid NOT NULL REFERENCES resource_types(id),
  name varchar(150) NOT NULL,
  location varchar(150),
  capacity int CHECK (capacity IS NULL OR capacity > 0),
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES resources(id),
  user_id uuid NOT NULL REFERENCES users(id),
  title varchar(200) NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED','CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT no_overlapping_reservations
    EXCLUDE USING gist (resource_id WITH =, tstzrange(start_time, end_time, '[)') WITH &&)
    WHERE (status = 'CONFIRMED')
);
CREATE INDEX idx_reservations_resource_start ON reservations (resource_id, start_time);
CREATE INDEX idx_reservations_user ON reservations (user_id);
