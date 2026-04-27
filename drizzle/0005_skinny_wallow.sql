ALTER TABLE "message_devliveries" RENAME TO "message_deliveries";--> statement-breakpoint
ALTER TABLE "message_deliveries" RENAME COLUMN "device_id" TO "sender_device_id";--> statement-breakpoint
ALTER TABLE "message_deliveries" RENAME COLUMN "user_id" TO "sender_user_id";--> statement-breakpoint
ALTER TABLE "message_deliveries" RENAME COLUMN "cipthertext" TO "ciphertext";--> statement-breakpoint
ALTER TABLE "message_deliveries" DROP CONSTRAINT "message_devliveries_message_id_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "message_deliveries" DROP CONSTRAINT "message_devliveries_device_id_devices_id_fk";
--> statement-breakpoint
ALTER TABLE "message_deliveries" DROP CONSTRAINT "message_devliveries_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "message_deliveries" ADD COLUMN "recipient_device_id" uuid;--> statement-breakpoint
ALTER TABLE "message_deliveries" ADD COLUMN "recipient_user_id" uuid;--> statement-breakpoint
ALTER TABLE "message_deliveries" ADD COLUMN "identity_key" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "message_deliveries" ADD COLUMN "message_counter" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "message_deliveries" ADD CONSTRAINT "message_deliveries_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_deliveries" ADD CONSTRAINT "message_deliveries_sender_device_id_devices_id_fk" FOREIGN KEY ("sender_device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_deliveries" ADD CONSTRAINT "message_deliveries_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_deliveries" ADD CONSTRAINT "message_deliveries_recipient_device_id_devices_id_fk" FOREIGN KEY ("recipient_device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_deliveries" ADD CONSTRAINT "message_deliveries_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;