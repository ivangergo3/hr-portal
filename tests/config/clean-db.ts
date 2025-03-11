import { createClient } from "@supabase/supabase-js";

export async function cleanupTable(
    tableName: string,
    columnName: string,
    filter: string,
) {
    console.log(`Cleaning up test ${tableName} from the database...`);

    // Get environment variables for Supabase connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env
        .NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error(
            "Supabase URL or Service Role Key not found in environment variables",
        );
        return;
    }

    try {
        // Create a Supabase client with the service role key for admin access
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Delete all test ${tableName} (those created during the test run)
        // We can identify them by their names which contain timestamps
        const { error } = await supabase
            .from(tableName)
            .delete()
            .like(columnName, filter);

        if (error) {
            console.error(`Error cleaning up test ${tableName}:`, error);
        } else {
            console.log(`Successfully cleaned up test ${tableName}`);
        }
    } catch (error) {
        console.error(`Error in cleanup function: ${error}`);
    }
}
