-- Database export from project: 68d5a3b6-99a3-44d6-8a91-440bc5253b4c
-- Database name: 68d5a3b6-99a3-44d6-8a91-440bc5253b4c-db
-- Exported at: 2026-02-13T18:35:29.913564+00:00

-- Table: members
DROP TABLE IF EXISTS "members";
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  password TEXT ,
  name TEXT ,
  name_en TEXT ,
  role TEXT ,
  status TEXT ,
  phone TEXT ,
  affiliation TEXT ,
  department TEXT ,
  position TEXT ,
  member_type TEXT ,
  join_date DATETIME ,
  last_login DATETIME ,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: government
DROP TABLE IF EXISTS "government";
CREATE TABLE government (
  id TEXT PRIMARY KEY,
  name TEXT ,
  logo TEXT ,
  url TEXT ,
  display_order REAL ,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: partners
DROP TABLE IF EXISTS "partners";
CREATE TABLE partners (
  id TEXT PRIMARY KEY,
  name TEXT ,
  logo TEXT ,
  url TEXT ,
  display_order REAL ,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
