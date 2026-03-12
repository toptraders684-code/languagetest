-- CRM Database Schema for Second-Hand Car Resale

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'sales_executive', 'manager')),
  phone VARCHAR(20),
  status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  variant VARCHAR(50),
  year INTEGER NOT NULL,
  mileage INTEGER,
  fuel_type VARCHAR(20) CHECK (fuel_type IN ('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG')),
  transmission VARCHAR(20) CHECK (transmission IN ('Manual', 'Automatic')),
  color VARCHAR(30),
  registration_number VARCHAR(30) UNIQUE,
  price_expected NUMERIC(12, 2),
  purchase_price NUMERIC(12, 2),
  condition_notes TEXT,
  images TEXT[], -- array of image URLs/paths
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(150),
  city VARCHAR(50),
  budget NUMERIC(12, 2),
  interested_car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
  source VARCHAR(30) CHECK (source IN ('walk_in', 'website', 'referral', 'marketplace')),
  status VARCHAR(30) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'interested', 'test_drive_scheduled', 'negotiation', 'closed_won', 'closed_lost')),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Drives table
CREATE TABLE IF NOT EXISTS test_drives (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP NOT NULL,
  location VARCHAR(200),
  sales_executive_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_feedback TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  sale_price NUMERIC(12, 2) NOT NULL,
  commission NUMERIC(12, 2),
  payment_mode VARCHAR(30) CHECK (payment_mode IN ('cash', 'finance', 'bank_transfer', 'cheque')),
  status VARCHAR(20) NOT NULL DEFAULT 'negotiation'
    CHECK (status IN ('negotiation', 'confirmed', 'completed', 'cancelled')),
  closed_date TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Follow-ups table
CREATE TABLE IF NOT EXISTS followups (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  notes TEXT,
  next_followup_date DATE,
  sales_executive_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity Timeline table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('lead_created', 'call', 'email', 'test_drive', 'negotiation', 'deal_closed', 'followup', 'note', 'status_change')),
  description TEXT,
  performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_brand_model ON cars(brand, model);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_car_id ON deals(car_id);
CREATE INDEX idx_followups_date ON followups(next_followup_date);
CREATE INDEX idx_followups_sales_exec ON followups(sales_executive_id);
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_test_drives_date ON test_drives(scheduled_date);

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, password, role, phone, status)
VALUES ('Admin User', 'admin@carcrm.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfc6cXHiMZ6QhBKz0S5OqfRGwMJEuVGi', 'admin', '1234567890', 'active')
ON CONFLICT (email) DO NOTHING;
