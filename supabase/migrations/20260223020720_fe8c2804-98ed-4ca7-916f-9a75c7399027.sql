ALTER TABLE records DROP CONSTRAINT IF EXISTS records_type_check;
ALTER TABLE records DROP CONSTRAINT IF EXISTS records_types_check;
ALTER TABLE records ADD CONSTRAINT records_type_check 
  CHECK (type = ANY (ARRAY[
    'sleep', 'feeding', 'night_wake', 'diaper',
    'bath', 'potty', 'water', 'solid_food'
  ]));