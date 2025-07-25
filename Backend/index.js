const express = require("express");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");

const app = express();

// Configure CORS first, before other middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://itabaza-2qjt.vercel.app',
            'https://itabaza-2qjt.vercel.app/',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://0.0.0.0:3000'
        ];
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // For debugging: log rejected origins
        console.log('CORS: Rejected origin:', origin);
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-HTTP-Method-Override'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    preflightContinue: false
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HTTP-Method-Override');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Additional middleware to ensure CORS headers are always present
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://itabaza-2qjt.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://0.0.0.0:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HTTP-Method-Override');
    
    next();
});

const { userRouter } = require("./routers/user.router");
const { supabase } = require("./config/db");
// const { authenticate } = require("./middlewares/authenticator.mw");
const { doctorRouter } = require("./routers/doctor.router");
const { departmentRouter } = require("./routers/department.router");
const { appointmentRouter } = require("./routers/appointment.router");
const { enhancedAppointmentRouter } = require("./routers/enhanced-appointment.router");
const { emailConfirmationRouter } = require("./routers/email-confirmation.router");
const { dashboardRouter } = require("./routers/adminDash.router");
const { audioRouter } = require("./routers/audio.router");
const dashboardApiRouter = require("./routers/dashboard.router");
const adminDashboardRouter = require("./routers/admin-dashboard.router");
const { authRouter } = require("./routers/auth.router");
// const { authenticate } = require("./middlewares/authenticator.mw");



// Unified Authentication Routes
app.use("/auth", authRouter);

// Original Routes (preserved for backward compatibility)
app.use("/user", userRouter);
app.use("/department",departmentRouter);
app.use("/doctor", doctorRouter);
app.use("/appointment",appointmentRouter);
app.use("/enhanced-appointment", enhancedAppointmentRouter);
app.use("/email-confirmation", emailConfirmationRouter);
app.use("/admin", dashboardRouter);
app.use("/audio", audioRouter);
app.use("/api/dashboard", dashboardApiRouter);
app.use("/api/admin", adminDashboardRouter);

// Serve static frontend files from the Frontend directory
app.use(express.static('./Frontend'));

// Test Supabase connection
app.get("/api/health", async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    res.json({ status: "Connected to Supabase", data });
  } catch (error) {
    res.status(500).json({ status: "Database connection failed", error: error.message });
  }
});

// Test Supabase connectivity and insert
app.get('/test-supabase', async (req, res) => {
  try {
    // Fetch a real user ID
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (userError || !users || users.length === 0) {
      return res.status(500).json({ error: "No users found in users table" });
    }

    // Fetch a real doctor ID
    const { data: doctors, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .limit(1);

    if (doctorError || !doctors || doctors.length === 0) {
      return res.status(500).json({ error: "No doctors found in doctors table" });
    }

    const testUserId = users[0].id;
    const testDoctorId = doctors[0].id;

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        patient_id: testUserId,
        doctor_id: testDoctorId,
        patient_first_name: 'Test',
        doc_first_name: 'Test',
        age_of_patient: 1,
        gender: 'M',
        address: 'Test',
        problem_description: 'Test',
        appointment_date: '2024-01-01',
        status: false
      }])
      .select();
    if (error) return res.status(500).json({ error });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(process.env.PORT || 8080, async () => {
  try {
    console.log("Connected to Supabase");
    console.log(`Server listening at ${process.env.PORT || 8080}`);
    console.log('Server is up and running with necessary routes!');
  } catch (error) {
    console.log("Error connecting to database:", error);
  }
});
