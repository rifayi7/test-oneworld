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
('Deep Well Cleaning', 'Water Services', 'Complete debris removal and deep cleaning of domestic wells for clean water supply.', '₹2,499', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 1),
('Pond Cleaning', 'Water Services', 'Algae removal, water treatment, and ecosystem optimization for clean backyard ponds.', '₹3,999', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 2),
('Water Tank Cleaning', 'Water Services', 'High-pressure jet wash, disinfection, and vacuum cleaning of residential water tanks.', '₹799', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/water-tank.webp', 3),
('UV Treatment Setup', 'Water Services', 'Integration of modern UV sterilizers for biological disinfection of home water supply.', '₹4,499', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 4),
('Pipeline Cleaning', 'Water Services', 'Chemical-free descaling and high-pressure flushing of building water distribution pipelines.', '₹1,899', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 5),
('Water Purifier Installation', 'Water Services', 'RO / UV / RO+UV multi-stage domestic water purifier mounting and plumbing setup.', '₹999', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 6),
('Water Tank Filter', 'Water Services', 'Installation of sediment and iron filters at water tank inlet for suspended solids removal.', '₹1,599', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 7),
('CCTV Installation', 'Home Safety', 'Premium HD smart home camera mounting, network configuration, and live monitoring setup.', '₹2,999', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/cctv-install.webp', 8),
('Gas Leak Detector', 'Home Safety', 'LPG leakage alarm mounting and gas valve safety check for kitchen protection.', '₹1,299', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 9),
('Roof Waterproofing', 'Home Safety', 'Multi-layered elastomeric chemical coating to stop slabs, roofs, and walls leaking.', '₹9,999', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/roof-waterproof.webp', 10),
('Solar Installation', 'Home Safety', 'Rooftop solar panel integration and grid connectivity with subsidy assistance.', '₹45,000', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 11),
('Grass Cutting', 'Outdoor Services', 'Quick commercial brushcutter trimming of tall grass and weeds in yard gardens.', '₹899', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/grass-trimming.webp', 12),
('Weed Removal', 'Outdoor Services', 'Manual and roots weeding of unwanted grass, weeds, and wild creepers in garden boundaries.', '₹799', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/grass-trimming.webp', 13),
('Compound Wall Cleaning', 'Outdoor Services', 'High-pressure water washing of concrete boundary walls to remove mold and stains.', '₹1,499', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 14),
('Interlock Cleaning', 'Outdoor Services', 'Jet washing of paved pathways and interlock tiles to restore bright clean finish.', '₹1,299', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 15),
('Termite Control', 'Pest Control', 'Chemical injection treatment at foundation walls and wood components to kill termites.', '₹3,499', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 16),
('Disinfection Spraying', 'Pest Control', 'Full space sanitization spraying for commercial, apartments, and villas.', '₹1,199', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 17),
('Coconut Planting', 'Farm Services', 'Soil preparation, organic manuring, and planting of hybrid high-yield coconut saplings.', '₹499', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 18),
('Basin Making', 'Farm Services', 'Digging and circular bunding around coconut trees for water harvesting and fertilizer feeding.', '₹299', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 19),
('Coconut Plucking', 'Farm Services', 'Safe climbing and mechanical plucking of ripe coconuts and dry fronds.', '₹199', 'https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp', 20);
