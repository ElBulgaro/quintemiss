-- Add unique constraint on user_id in scores table
ALTER TABLE scores ADD CONSTRAINT scores_user_id_key UNIQUE (user_id);