-- MongoDB Setup Instructions
-- This is a reference file for MongoDB setup

-- 1. Install MongoDB locally or use MongoDB Atlas (cloud)
-- 2. Create a database called 'voting-system'
-- 3. Set the MONGODB_URI environment variable:
--    Local: mongodb://localhost:27017/voting-system
--    Atlas: mongodb+srv://username:password@cluster.mongodb.net/voting-system

-- The application will automatically create the required collections:
-- - groups: Stores voting groups with options and votes

-- Indexes will be created automatically by Mongoose:
-- - createdAt: -1 (for sorting groups by creation date)
-- - votes.ip: 1 (for checking duplicate votes)

-- Sample environment variables for .env.local:
-- MONGODB_URI=mongodb://localhost:27017/voting-system
-- or
-- MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting-system
