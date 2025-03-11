-- Drop the existing update policy
DROP POLICY IF EXISTS "Enable update for users based on id" ON "public"."users";

-- Create a new policy that allows admins to update any user
CREATE POLICY "Enable update for users based on id or admin role" ON "public"."users" FOR
UPDATE USING (
  (auth.uid () = id)
  OR EXISTS (
    SELECT
      1
    FROM
      users
    WHERE
      users.id = auth.uid ()
      AND users.role = 'admin'
  )
);
