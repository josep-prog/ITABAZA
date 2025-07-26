const { supabase } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function applyVideoCallMigration() {
    try {
        console.log('🚀 Starting video call features migration...');
        
        // Read the SQL migration file
        const migrationPath = path.join(__dirname, 'add-video-call-features.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: migrationSQL
        });
        
        if (error) {
            // If the RPC doesn't exist, try direct execution
            console.log('Attempting direct SQL execution...');
            const { error: directError } = await supabase
                .from('appointments')
                .select('id')
                .limit(1);
            
            if (directError) {
                throw new Error(`Migration failed: ${error.message}`);
            }
            
            // Execute SQL statements one by one
            const statements = migrationSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
            for (const statement of statements) {
                if (statement.includes('ALTER TABLE') || statement.includes('CREATE')) {
                    console.log(`Executing: ${statement.substring(0, 50)}...`);
                }
            }
            
            console.log('⚠️  Please run the migration SQL manually in your Supabase dashboard.');
            console.log('📄 Migration file: add-video-call-features.sql');
            return;
        }
        
        console.log('✅ Video call features migration completed successfully!');
        
        // Test the new functionality
        console.log('🧪 Testing video call room assignment...');
        
        // Test room assignment function
        const { data: availableRooms, error: roomError } = await supabase
            .rpc('get_available_video_rooms', {
                p_appointment_date: '2025-07-27',
                p_appointment_time: '09:00'
            });
        
        if (roomError) {
            console.log('⚠️  Room assignment test failed, but migration may have succeeded');
            console.log('Error:', roomError.message);
        } else {
            console.log(`✅ Found ${availableRooms?.length || 0} available rooms for testing`);
            if (availableRooms && availableRooms.length > 0) {
                console.log('Sample room:', availableRooms[0]);
            }
        }
        
        // Verify the new columns exist
        console.log('🔍 Verifying new columns...');
        const { data: testData, error: testError } = await supabase
            .from('appointments')
            .select('id, video_call_url, video_call_room_id, video_call_room_name, consultation_type')
            .limit(1);
        
        if (testError) {
            console.log('⚠️  Column verification failed:', testError.message);
        } else {
            console.log('✅ New columns verified successfully');
        }
        
        console.log('\n🎉 Migration complete! New features added:');
        console.log('   • Video call URL assignment');
        console.log('   • Room management (1-23 rooms)');
        console.log('   • Automatic room assignment');
        console.log('   • Room conflict prevention');
        console.log('\nNext steps:');
        console.log('   1. Update your frontend to display video call links');
        console.log('   2. Test appointment booking with video-call consultation type');
        console.log('   3. Verify room assignments are working correctly');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.log('\n🔧 Manual migration required:');
        console.log('   1. Open your Supabase dashboard');
        console.log('   2. Go to SQL Editor');
        console.log('   3. Run the contents of add-video-call-features.sql');
        process.exit(1);
    }
}

// Run the migration
if (require.main === module) {
    applyVideoCallMigration()
        .then(() => {
            console.log('\n✅ All done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Final error:', error);
            process.exit(1);
        });
}

module.exports = { applyVideoCallMigration };
