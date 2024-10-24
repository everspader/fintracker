ALTER TABLE "verification_tokens" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_tokens" DROP COLUMN IF EXISTS "identifier";