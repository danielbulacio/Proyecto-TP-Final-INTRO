INSERT INTO parcelas (nombre, latitud, longitud) VALUES
  ('Lote Norte', -34.603722, -58.381592),
  ('Lote Sur',   -33.118333, -64.349722),
  ('Campo Este', -32.412300, -63.240000);

-- cultivos
INSERT INTO cultivos (nombre_cultivo, parcela_id, tipo, temperatura_optima, dias_de_cosecha, mililitros_necesarios) VALUES
  ('Soja',  1, 'oleaginosa', 24, 120, 450),
  ('Maíz',  2, 'cereal',     28, 140, 600),
  ('Trigo', 3, 'cereal',     18, 100, 400);

-- detalle_parcela
INSERT INTO detalle_parcela (parcela_id, fecha, temperatura, precipitacion, humedad_suelo, evapotranspiracion) VALUES
  -- primera parcela
  (1, '2026-06-10', 12.5, 0.0, 60.0, 2.1),
  (1, '2026-06-11', 14.2, 3.5, 65.0, 1.8),
  (1, '2026-06-12', 11.8, 0.0, 62.0, 2.4),
  (1, '2026-06-13', 15.6, 8.1, 70.0, 1.5),
  (1, '2026-06-14', 13.1, 0.0, 58.0, 2.7),
  (1, '2026-06-15', 16.0, 1.2, 61.0, 3.0),
  -- seg
  (2, '2026-06-10', 10.3, 0.0, 55.0, 2.0),
  (2, '2026-06-11', 12.7, 2.2, 59.0, 1.9),
  (2, '2026-06-12', 11.0, 0.0, 57.0, 2.3),
  -- ter
  (3, '2026-06-10',  9.5, 0.0, 52.0, 1.7),
  (3, '2026-06-11',  8.9, 5.0, 60.0, 1.4),
  (3, '2026-06-12', 10.6, 0.0, 54.0, 2.0);

--tareas
INSERT INTO tareas (parcela_id, tarea, hecho) VALUES
  (1, 'Regar sector A',         false),
  (1, 'Revisar plaga en hojas', true),
  (2, 'Fertilizar',             false),
  (3, 'Control de malezas',     false);
