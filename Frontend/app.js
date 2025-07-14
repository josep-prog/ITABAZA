import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🟢 Plug in your actual credentials
const supabaseUrl = 'https://ffajyjqtidprerlmebvf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmYWp5anF0aWRwcmVybG1lYnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4ODYyMzQsImV4cCI6MjA2NzQ2MjIzNH0.d4SZh6d8M8oKZk0fr5jsMRuZQo_lghIS2p0mbg74yQQ'

const supabase = createClient(supabaseUrl, supabaseKey)

// 📥 Fetch data from a table (example: users)
async function fetchUsers() {
  const { data, error } = await supabase
    .from('users') // Using existing users table
    .select('id, email, created_at')
    .limit(5) // Limit to 5 records for testing

  const output = document.getElementById('output')

  // Check if output element exists
  if (!output) {
    console.warn('⚠️ No element with id="output" found in HTML')
    return
  }

  if (error) {
    console.error('❌ Error:', error)
    output.textContent = '❌ Failed to load data: ' + error.message
  } else {
    console.log('✅ Data:', data)
    output.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`
  }
}

fetchUsers()
