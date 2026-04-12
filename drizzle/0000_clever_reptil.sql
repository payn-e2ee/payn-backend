CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"firstname" varchar,
	"lastname" varchar,
	"password" varchar NOT NULL,
	"phone_number" integer NOT NULL,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp
);
