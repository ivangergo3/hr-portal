

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_dashboard_metrics"("start_date" timestamp without time zone, "end_date" timestamp without time zone) RETURNS "json"
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
  RETURN json_build_object(
    'total_hours', (
      SELECT COALESCE(sum(total_hours), 0)
      FROM timesheet_weeks
      WHERE week_start_date >= $1
      AND week_start_date <= $2
      AND status = 'approved'
    ),
    
    'active_projects', (
      SELECT COALESCE(count(*), 0)
      FROM projects
      WHERE archived = false
    ),
    
    'pending_timesheets', (
      SELECT COALESCE(count(*), 0)
      FROM timesheet_weeks
      WHERE status = 'submitted'
      AND week_start_date >= $1
      AND week_start_date <= $2
    ),
    
    'pending_timeoffs', (
      SELECT COALESCE(count(*), 0)
      FROM time_off_requests
      WHERE status = 'submitted'
      AND time_off_requests.start_date >= $1
      AND time_off_requests.end_date <= $2
    ),
    
    'active_employees', (
      SELECT COALESCE(count(*), 0)
      FROM users
      WHERE active = true
      AND (archived_at IS NULL OR archived_at > $2)
    )
  );
END;
$_$;


ALTER FUNCTION "public"."get_dashboard_metrics"("start_date" timestamp without time zone, "end_date" timestamp without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    'employee'
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_timesheet_week_total_hours"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update total_hours in timesheet_weeks
  UPDATE timesheet_weeks 
  SET 
    total_hours = (
      SELECT COALESCE(SUM(
        COALESCE(monday_hours, 0) + 
        COALESCE(tuesday_hours, 0) + 
        COALESCE(wednesday_hours, 0) + 
        COALESCE(thursday_hours, 0) + 
        COALESCE(friday_hours, 0) + 
        COALESCE(saturday_hours, 0) + 
        COALESCE(sunday_hours, 0)
      ), 0)
      FROM timesheets 
      WHERE week_id = NEW.week_id
    ),
    updated_at = now()
  WHERE id = NEW.week_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_timesheet_week_total_hours"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."time_off_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "time_off_requests_check" CHECK (("end_date" >= "start_date")),
    CONSTRAINT "time_off_requests_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'submitted'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "time_off_requests_type_check" CHECK (("type" = ANY (ARRAY['vacation'::"text", 'sick'::"text", 'personal'::"text"])))
);


ALTER TABLE "public"."time_off_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."timesheet_weeks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "week_start_date" "date",
    "status" "text" DEFAULT 'draft'::"text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "rejection_reason" "text",
    "total_hours" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."timesheet_weeks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."timesheets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "week_start_date" "date" NOT NULL,
    "client_id" "uuid",
    "project_id" "uuid",
    "description" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "rejection_reason" "text",
    "monday_hours" numeric,
    "tuesday_hours" numeric,
    "wednesday_hours" numeric,
    "thursday_hours" numeric,
    "friday_hours" numeric,
    "saturday_hours" numeric,
    "sunday_hours" numeric,
    "total_hours" numeric GENERATED ALWAYS AS (((((((COALESCE("monday_hours", (0)::numeric) + COALESCE("tuesday_hours", (0)::numeric)) + COALESCE("wednesday_hours", (0)::numeric)) + COALESCE("thursday_hours", (0)::numeric)) + COALESCE("friday_hours", (0)::numeric)) + COALESCE("saturday_hours", (0)::numeric)) + COALESCE("sunday_hours", (0)::numeric))) STORED,
    "week_id" "uuid",
    CONSTRAINT "timesheets_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'submitted'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."timesheets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'employee'::"text" NOT NULL,
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "active" boolean DEFAULT true,
    "archived_at" timestamp with time zone,
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'employee'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_name_client_unique" UNIQUE ("name", "client_id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timesheet_weeks"
    ADD CONSTRAINT "timesheet_weeks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timesheet_weeks"
    ADD CONSTRAINT "timesheet_weeks_user_id_week_start_date_key" UNIQUE ("user_id", "week_start_date");



ALTER TABLE ONLY "public"."timesheets"
    ADD CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timesheets"
    ADD CONSTRAINT "timesheets_user_week_project_unique" UNIQUE ("user_id", "week_start_date", "project_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "update_timesheet_week_total_hours" AFTER INSERT OR DELETE OR UPDATE ON "public"."timesheets" FOR EACH ROW EXECUTE FUNCTION "public"."update_timesheet_week_total_hours"();



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timesheet_weeks"
    ADD CONSTRAINT "timesheet_weeks_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."timesheet_weeks"
    ADD CONSTRAINT "timesheet_weeks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."timesheets"
    ADD CONSTRAINT "timesheets_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."timesheets"
    ADD CONSTRAINT "timesheets_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."timesheets"
    ADD CONSTRAINT "timesheets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."timesheets"
    ADD CONSTRAINT "timesheets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timesheets"
    ADD CONSTRAINT "timesheets_week_id_fkey" FOREIGN KEY ("week_id") REFERENCES "public"."timesheet_weeks"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete clients" ON "public"."clients" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can do everything with projects" ON "public"."projects" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can do everything with timesheets" ON "public"."timesheets" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can insert clients" ON "public"."clients" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update any time off request" ON "public"."time_off_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update clients" ON "public"."clients" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update weekly timesheet status" ON "public"."timesheet_weeks" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all time off requests" ON "public"."time_off_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all timesheets" ON "public"."timesheets" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all weekly timesheets" ON "public"."timesheet_weeks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Authenticated users can view clients" ON "public"."clients" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view projects" ON "public"."projects" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Employees can view non-archived projects" ON "public"."projects" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'employee'::"text")))) AND (NOT "archived")));



CREATE POLICY "Enable insert access for all authenticated users" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all authenticated users" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable update for users based on id" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can create their own time off requests" ON "public"."time_off_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own weekly timesheets" ON "public"."timesheet_weeks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own draft timesheets" ON "public"."timesheets" TO "authenticated" USING ((("user_id" = "auth"."uid"()) AND ("status" = 'draft'::"text")));



CREATE POLICY "Users can update their own draft requests" ON "public"."time_off_requests" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("status" = 'draft'::"text"))) WITH CHECK ((("auth"."uid"() = "user_id") AND ("status" = 'draft'::"text")));



CREATE POLICY "Users can update their own weekly timesheets" ON "public"."timesheet_weeks" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("status" = ANY (ARRAY['draft'::"text", 'pending'::"text"]))));



CREATE POLICY "Users can view their own time off requests" ON "public"."time_off_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own time off requests and admins can view " ON "public"."time_off_requests" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view their own timesheets" ON "public"."timesheets" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own timesheets and admins can view all" ON "public"."timesheets" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view their own weekly timesheets" ON "public"."timesheet_weeks" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_off_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timesheet_weeks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timesheets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."get_dashboard_metrics"("start_date" timestamp without time zone, "end_date" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_metrics"("start_date" timestamp without time zone, "end_date" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_metrics"("start_date" timestamp without time zone, "end_date" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_timesheet_week_total_hours"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_timesheet_week_total_hours"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_timesheet_week_total_hours"() TO "service_role";


















GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."time_off_requests" TO "anon";
GRANT ALL ON TABLE "public"."time_off_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."time_off_requests" TO "service_role";



GRANT ALL ON TABLE "public"."timesheet_weeks" TO "anon";
GRANT ALL ON TABLE "public"."timesheet_weeks" TO "authenticated";
GRANT ALL ON TABLE "public"."timesheet_weeks" TO "service_role";



GRANT ALL ON TABLE "public"."timesheets" TO "anon";
GRANT ALL ON TABLE "public"."timesheets" TO "authenticated";
GRANT ALL ON TABLE "public"."timesheets" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
