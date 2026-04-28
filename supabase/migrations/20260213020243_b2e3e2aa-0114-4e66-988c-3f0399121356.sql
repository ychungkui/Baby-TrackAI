UPDATE records
SET start_time = start_time - INTERVAL '1 day'
WHERE baby_id = 'e14e71be-249c-4e4b-a620-9634df734c30'
  AND created_at::date = '2026-02-12'
  AND start_time::date = '2026-02-13';