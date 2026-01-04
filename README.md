RevenuePulse – Client Follow-Up & Payment Tracking CRM

RevenuePulse is a full-stack MERN web application built to help businesses manage client follow-ups, track payments, and automate customer communication through SMS and Email reminders.

Tech I used
Frontend:

React
Vite
TailwindCSS
Chart.js for the graphs
Backend:

Node.js & Express
MongoDB
JWT for auth
bcrypt to hash passwords
Twilio (SMS), Nodemailer (Email)

How to run this locally
Step 1: Get MongoDB running
Either install MongoDB locally or use MongoDB Atlas (free tier works great!)

Step 2: Backend setup
cd backend
npm install
Create a .env file in the backend folder:

MONGODB_URI=
JWT_SECRET=
PORT=
Then start the server:

npm run dev
Step 3: Frontend setup
cd frontend
npm install
Create a .env file in the frontend folder:

VITE_API_URL=
Start the app:

npm run dev
Step 4: Open your browser!
Go to http://localhost:5173 and you should see the login page!

Key Features

Client and payment management with status tracking
Automated follow-up reminders for pending payments
SMS notifications using Twilio API
Email alerts using Nodemailer
Secure authentication with JWT
Responsive and clean dashboard UI
