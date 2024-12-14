-- Get the user's predictions and match them with candidate rankings
WITH user_predictions AS (
  SELECT 
    p.predictions,
    array_position(p.predictions, sc.id) as predicted_position,
    sc.name,
    sc.region,
    sc.ranking
  FROM predictions p
  JOIN sheet_candidates sc ON sc.id = ANY(p.predictions)
  WHERE p.user_id = '686f3fed-5562-416c-a030-31f10e3d3a78'
  ORDER BY array_position(p.predictions, sc.id)
)
SELECT 
  predicted_position,
  name,
  region,
  ranking,
  CASE 
    WHEN ranking IN ('miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5', 'top15') THEN 10
    ELSE 0
  END as top15_points,
  CASE 
    WHEN ranking IN ('miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5') THEN 20
    ELSE 0
  END as top5_points,
  CASE 
    WHEN (ranking = 'miss_france' AND predicted_position = 1) OR
         (ranking = '1ere_dauphine' AND predicted_position = 2) OR
         (ranking = '2eme_dauphine' AND predicted_position = 3) OR
         (ranking = '3eme_dauphine' AND predicted_position = 4) OR
         (ranking = '4eme_dauphine' AND predicted_position = 5) THEN 50
    ELSE 0
  END as position_points,
  CASE 
    WHEN ranking = 'miss_france' AND predicted_position = 1 THEN 50
    ELSE 0
  END as winner_bonus
FROM user_predictions;