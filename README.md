# RevenuePulse 💰📊

RevenuePulse is a full-stack MERN CRM application designed to automate business follow-ups, track client payments, and enable multi-channel customer communication through SMS and Email notifications.

## What does it do?

Helps you manage your business by:
- 👥 Track all your clients in one place
- 💸 Monitor pending payments and due dates
- 📱 Send automated SMS reminders (using Twilio!)
- 📧 Email notifications for important updates
- 📈 Real-time dashboard to see business health
- ⏰ Automated follow-ups so you never forget to reach out

## Why I made this

Small and medium businesses struggle to manage customer follow-ups, overdue payments, and communication because they rely on manual methods like Excel, WhatsApp, or paper notes. This leads to missed opportunities, delayed collections, and inefficient customer engagement.

## The problem it solves

Small businesses lose money because:
- They forget to follow up with clients
- Payment tracking is manual and messy
- No reminders for due payments
- Can't see overall business health at a glance

RevenuePulse fixes all of this with automation and a clean dashboard!

## Tech Stack

**Frontend:**
- React.js (with TypeScript for type safety!)
- Tailwind CSS
- Axios for API calls
- React Router for navigation
- Charts/graphs for the dashboard

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication (secure login/signup)
- Twilio API (for sending SMS reminders)
- Nodemailer (for email notifications)
- RESTful API design

## Features I'm super proud of

### 1. **Client Management**
- Add, edit, delete clients
- Store contact info, business details, payment terms
- Search and filter clients easily

### 2. **Payment Tracking**
- Record invoices and payments
- See pending vs completed payments
- Track payment history per client

### 3. **Automated Reminders**
- Set up automatic SMS reminders via Twilio
- Email reminders through Nodemailer
- Customize reminder schedules (3 days before, on due date, etc.)

### 4. **Real-time Dashboard**
- Total revenue overview
- Pending payments at a glance
- Recent activities
- Visual charts showing business trends

### 5. **Follow-up System**
- Schedule follow-ups with clients
- Get notified when it's time to reach out
- Mark follow-ups as completed

## How to run this locally

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Twilio account (free trial works!)
- Gmail account for Nodemailer

### Step 1: Clone and setup
```bash
git clone https://github.com/yourusername/revenuepulse.git
cd revenuepulse
```

### Step 2: Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/revenuepulse

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=5001
NODE_ENV=development

# Twilio (get these from twilio.com)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email (using Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

**Important:** For Gmail, you need to generate an "App Password" from your Google Account settings!

Start the backend:
```bash
npm run dev
```

### Step 3: Frontend setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:
```env
VITE_API_URL=http://localhost:5001
```

Start the frontend:
```bash
npm run dev
```

### Step 4: Open in browser

Go to `http://localhost:5173` and start managing your clients!

## API Endpoints (for reference)

### Auth
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Add new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record new payment
- `GET /api/payments/pending` - Get pending payments

### Reminders
- `POST /api/reminders/send-sms` - Send SMS reminder
- `POST /api/reminders/send-email` - Send email reminder

## Screenshots

(TODO: Add screenshots after polishing the UI)

## What I learned building this

- **Twilio Integration** - Sending SMS programmatically is SO cool
- **Email automation** - Nodemailer and Gmail App Passwords
- **TypeScript** - Caught so many bugs before runtime!
- **Real-world CRM logic** - Payment cycles, follow-up workflows
- **Security** - Password hashing, JWT tokens, environment variables
- **API design** - RESTful best practices
- **Error handling** - Proper try-catch and user-friendly error messages

## Challenges I faced

1. **Twilio costs** - SMS isn't free, so I had to be smart about when to send
2. **Email deliverability** - Gmail blocks suspicious activity, needed App Passwords
3. **Date handling** - Timezones are confusing! Used libraries to help
4. **State management** - Learned to use Context API properly

## Future improvements

- [ ] WhatsApp integration (Twilio supports this!)
- [ ] Export reports to PDF
- [ ] Multi-user support (for teams)
- [ ] Mobile app version
- [ ] Recurring payment automation
- [ ] Analytics and insights (revenue forecasting)
- [ ] Integration with accounting software

## Deployment

Not deployed yet, but planning to use:
- Frontend: Vercel or Netlify
- Backend: Railway or Render
- Database: MongoDB Atlas

## Troubleshooting

**SMS not sending?**
- Check your Twilio credentials
- Verify phone number format (+countrycode + number)
- Check Twilio account balance

**Emails not working?**
- Use Gmail App Password, not regular password
- Enable "Less secure app access" in Gmail settings
- Check spam folder

**MongoDB connection issues?**
- Make sure MongoDB is running
- Check connection string in `.env`


---
