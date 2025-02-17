# DocuMed - Modern Healthcare Management System

## Overview
DocuMed is a comprehensive healthcare management system built with Next.js, Firebase, and TypeScript. It facilitates seamless interactions between doctors and patients, streamlining the healthcare appointment process and medical record management.

## Features
- 🏥 **Dual Dashboard System**
  - Doctor Dashboard for managing appointments and patient records
  - Patient Dashboard for booking appointments and viewing medical history

- 🔐 **Secure Authentication**
  - Role-based access control (Doctor/Patient)
  - Protected routes and data access
  - Firebase Authentication integration

- 📅 **Appointment Management**
  - Real-time appointment scheduling
  - Status tracking (Pending, Approved, Rejected, Ongoing)
  - Automated status updates
  - Appointment modification capabilities

- 📋 **Medical Records**
  - Secure storage of patient medical history
  - Doctor-only modification rights
  - Structured data organization
  - Easy access to patient history

- 🏢 **Clinic Management**
  - Multiple clinic support
  - Location and specialty tracking
  - Doctor-clinic associations

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **UI Components**: Shadcn/ui
- **State Management**: React Context
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form, Zod
- **Date Handling**: date-fns

## Security
- Firestore Security Rules for data protection
- Role-based access control
- Secure data transmission
- Protected API routes

## Installation

```bash
# Clone the repository
git clone https://github.com/mohamedyaakoubi/documed.git

# Navigate to project directory
cd documed

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Environment Variables

```plaintext
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Project Structure

```plaintext
documed/
├── src/
│   ├── app/             # Next.js app router
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities and configurations
│   ├── types.ts        # TypeScript types
│   └── validation/     # Form validation schemas
├── public/             # Static assets
└── firebase.ts         # Firebase configurations
```

## Contributing
Contributions are welcome! Please read our Contributing Guide for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Contact
Mohamed Yaakoubi - [@Mohamed Yaakoubi](https://www.linkedin.com/in/yaakoubi-mohamed/)
Project Link: [https://github.com/mohamedyaakoubi/documed](https://github.com/mohamedyaakoubi/documed)

---
