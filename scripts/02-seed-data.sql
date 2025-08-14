-- Removed mock admin user, keeping only real ECU industry data
-- Insert ECU brands (real industry brands)
INSERT INTO ecu_brands (name) VALUES
('Bosch'),
('Continental'),
('Delphi'),
('Denso'),
('Magneti Marelli'),
('Siemens'),
('Visteon'),
('Hitachi'),
('Keihin'),
('Mitsubishi');

-- Insert real ECU models used in the industry
INSERT INTO ecu_models (brand_id, model, year_from, year_to, engine_type) VALUES
((SELECT id FROM ecu_brands WHERE name = 'Bosch'), 'EDC17CP14', 2010, 2018, 'Diesel'),
((SELECT id FROM ecu_brands WHERE name = 'Bosch'), 'MED17.5.5', 2008, 2015, 'Petrol'),
((SELECT id FROM ecu_brands WHERE name = 'Bosch'), 'EDC16C34', 2005, 2012, 'Diesel'),
((SELECT id FROM ecu_brands WHERE name = 'Continental'), 'SID807', 2012, 2020, 'Diesel'),
((SELECT id FROM ecu_brands WHERE name = 'Delphi'), 'DCM3.5', 2008, 2016, 'Diesel'),
((SELECT id FROM ecu_brands WHERE name = 'Denso'), '275700-4313', 2010, 2018, 'Diesel');

-- Insert real professional ECU tools used in the industry
INSERT INTO tools (name, brand, model, description) VALUES
('KESS V2', 'Alientech', 'Master', 'Professional ECU programming tool'),
('KTAG', 'Alientech', 'Master', 'Boot and bench ECU programming'),
('CMD Flash', 'CMD', 'Professional', 'Multi-brand ECU flasher'),
('MPPS V21', 'MPPS', 'V21', 'VAG group ECU programmer'),
('Galletto 1260', 'Galletto', '1260', 'OBD ECU flasher'),
('BDM100', 'BDM', '1255', 'BDM ECU programmer'),
('FGTech V54', 'FGTech', 'V54', 'Multi-brand ECU tool'),
('PCMFlash', 'PCMTuner', 'Professional', 'Ford/Mazda ECU tool');
