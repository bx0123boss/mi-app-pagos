CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY,
	"client_name" text NOT NULL,
	"total_amount" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distributions" (
	"id" serial PRIMARY KEY,
	"payment_id" integer NOT NULL,
	"person_name" text NOT NULL,
	"amount" double precision NOT NULL,
	"is_expense" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY,
	"contract_id" integer NOT NULL,
	"amount" double precision NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_contracts_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE;