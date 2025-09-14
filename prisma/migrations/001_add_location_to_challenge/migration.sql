-- AddLocationToChallenge
-- This migration adds latitude and longitude fields to the Challenge model

-- AlterTable
ALTER TABLE "challenges" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "challenges" ADD COLUMN "longitude" DOUBLE PRECISION;