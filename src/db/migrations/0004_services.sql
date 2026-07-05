-- Migration 0004_services: Create services table and seed initial data
CREATE TABLE IF NOT EXISTS services (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('Water Services', 'Home Safety', 'Outdoor Services', 'Pest Control', 'Farm Services')),
  desc        TEXT NOT NULL,
  price       TEXT NOT NULL,
-- Migration 0004_services: Create services table and seed initial data
CREATE TABLE IF NOT EXISTS services (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('Water Services', 'Home Safety', 'Outdoor Services', 'Pest Control', 'Farm Services')),
  desc        TEXT NOT NULL,
  price       TEXT NOT NULL,
  img         TEXT NOT NULL,
  sort        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO services (name, category, desc, price, img, sort) VALUES
('Deep Well Cleaning', 'Water Services', 'Complete debris removal and deep cleaning of domestic wells for clean water supply.', '₹3,200/-', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-01-10-34-1783242259780-lm8s9h.webp', 1),
('Pond Cleaning', 'Water Services', 'Algae removal, water treatment, and ecosystem optimization for clean backyard ponds.', '₹5,500/-', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-01-13-24-1783242242705-hsji7k.webp', 2),
('Pipeline Cleaning', 'Water Services', 'Chemical-free descaling and high-pressure flushing of building water distribution pipelines.', '₹1,500/-', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-35-1783242222286-hnna7f.webp', 3),
('Water Tank Cleaning & UV Treatment', 'Water Services', 'High-pressure jet wash, disinfection, and vacuum cleaning of residential water tanks.', '₹1,500/-', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/water-tank-cleaning-1783242201494-f5ufir.webp', 4),
('Water Tank Filter Fitting', 'Water Services', 'Installation of sediment and iron filters at water tank inlet for suspended solids removal.', '₹1,500/-', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-35-2-1783242151541-qo7iou.webp', 5),
('New Water Purifier Installation', 'Water Services', 'RO / UV / RO+UV multi-stage domestic water purifier mounting and plumbing setup.', '₹7,000/-', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/new-water-purifier-installation.webp', 6),
('New CCTV Installation', 'Home Safety', 'Premium HD smart home camera mounting, network configuration, and live monitoring setup.', '₹2,250/-', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/new-cctv-installation.webp', 7),
('New Gas Leak Detector Installation', 'Home Safety', 'LPG leakage alarm mounting and gas valve safety check for kitchen protection.', '₹3,500/-', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-36-1783242129977-ljusjg.webp', 8),
('Automatic Gate Open & Close System', 'Home Safety', 'Automated motorized swing or sliding gate opener system setup with remote controls.', '₹26,000/-', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/automatic-gate-open-close-system.webp', 9),
('Door Locking by Number System', 'Home Safety', 'Digital smart door lock installation with keyless passcode numeric keypad entry.', '₹9,000/-', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/door-locking-by-number-system.webp', 10),
('Solar Installation Service', 'Home Safety', 'Rooftop solar panel integration and grid connectivity with subsidy assistance.', '₹2,00,000/- with guarantee', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-36-1-1783242113683-zm7rja.webp', 11),
('Roof Top Water Proofing', 'Home Safety', 'Multi-layered elastomeric chemical coating to stop slabs, roofs, and walls leaking.', '₹80/- per sqft', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-37-2-1783242098008-4awa9y.webp', 12),
('Interlock Cleaning', 'Outdoor Services', 'Jet washing of paved pathways and interlock tiles to restore bright clean finish.', '₹1/- per sqft', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-37-1-1783242080493-pakbcj.webp', 13),
('Compound Wall Cleaning', 'Outdoor Services', 'High-pressure water washing of concrete boundary walls to remove mold and stains.', '₹1/- per sqft', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-37-1783242048063-dpwxg8.webp', 14),
('Weeder & Grass Cutting', 'Outdoor Services', 'Quick commercial brushcutter trimming of tall grass and weeds in yard gardens.', '₹50/- per cent', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-36-2-1783242030225-np8mkc.webp', 15),
('Weed Killer Spraying', 'Outdoor Services', 'Safe and effective targeted application of herbicides to eliminate unwanted wild weeds.', '₹50/- per cent', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-38-1783242011294-uv5snl.webp', 16),
('Pest Control Spraying', 'Outdoor Services', 'Large-scale compound and agricultural area spraying to control crop pests and insects.', '₹1,200/- per acre', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-38-1-1783241986308-9nyjd6.webp', 17),
('Coconut Plucking', 'Farm Services', 'Safe climbing and mechanical plucking of ripe coconuts and dry fronds.', '₹80/- per tree', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/coconut-plucking.webp', 18),
('Coconut Basin Making', 'Farm Services', 'Digging and circular bunding around coconut trees for water harvesting and fertilizer feeding.', '₹70/- per tree', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-38-3-1783241933909-baveiu.webp', 19),
('Coconut Planting', 'Farm Services', 'Soil preparation, organic manuring, and planting of hybrid high-yield coconut saplings.', '₹350/- per tree', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-03-at-11-09-38-2-1783241913795-ifyyae.webp', 20),
('Banana Plant Planting', 'Farm Services', 'Ground pit digging, fertilizing, and planting of high-yield domestic banana saplings.', '₹80/- per plant', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-05-at-13-57-28-1783242328799-d55rbj.webp', 21),
('Modern Farming', 'Farm Services', 'Mechanized tractor tillage, plowing, bed preparation, and modern farm setup assistance.', '₹1,200/- per hour (Tractor) + Labour charges extra', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-05-at-14-35-52-1783242374985-ndyq1h.webp', 22),
('Deep Cleaning', 'Pest Control', 'Thorough sanitizing and deep cleaning of rooms, floors, kitchens, and windows.', '₹5/- per sqft', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-05-at-14-10-13-1783241867988-98lx5p.webp', 23),
('Odourless Sanitizer Spraying', 'Pest Control', 'Premium eco-friendly, completely odourless chemical spraying for disinfection.', '₹2/- per sqft', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-05-at-14-17-19-1783241854136-l610fb.webp', 24),
('Odourless Termite Control Spraying', 'Pest Control', 'Anti-termite foundation wall and woodwork pressure spraying with odourless chemicals.', '₹3/- per sqft', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/whatsapp-image-2026-07-05-at-14-25-57-1783241841357-d9ebma.webp', 25);
