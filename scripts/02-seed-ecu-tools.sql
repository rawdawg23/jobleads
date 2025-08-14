-- Insert common ECU tools and supported vehicles
INSERT INTO ecu_tools (name, description, manufacturer, supported_vehicles) VALUES
('KESS V2', 'Professional ECU programming tool', 'Alientech', ARRAY['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Ford', 'Vauxhall', 'Peugeot', 'Citroen', 'Renault']),
('KTAG', 'ECU programming tool via OBD and Bench', 'Alientech', ARRAY['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Ford', 'Vauxhall', 'Peugeot', 'Citroen', 'Renault', 'Fiat']),
('CMD Flash', 'Professional ECU flashing tool', 'CMD', ARRAY['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Porsche']),
('MPPS V21', 'Multi-brand ECU chip tuning interface', 'MPPS', ARRAY['Audi', 'Volkswagen', 'Skoda', 'Seat', 'Bentley', 'Lamborghini']),
('Galletto 1260', 'OBDII ECU flashing tool', 'Galletto', ARRAY['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Ford', 'Vauxhall', 'Peugeot', 'Citroen']),
('BDM100', 'ECU programmer via BDM protocol', 'BDM', ARRAY['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Vauxhall', 'Peugeot', 'Citroen', 'Renault']),
('Dimsport New Genius', 'Professional ECU remapping tool', 'Dimsport', ARRAY['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Ford', 'Vauxhall', 'Peugeot', 'Citroen', 'Renault', 'Fiat', 'Alfa Romeo']),
('AutoTuner', 'Universal ECU programming tool', 'AutoTuner', ARRAY['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Ford', 'Vauxhall', 'Peugeot', 'Citroen', 'Renault', 'Fiat', 'Nissan', 'Toyota']);
