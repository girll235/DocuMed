import { db } from '@/lib/firebase';
import { collection, doc, writeBatch} from 'firebase/firestore';
import { COLLECTIONS, USER_ROLES, APPOINTMENT_STATUS } from '@/lib/constants';

const createCollections = async () => {
  console.log('Starting collections creation...');
  const batch = writeBatch(db);

  // Create base specialties with enhanced data
  const specialties = [
    { id: 'cardiology', name: 'Cardiology', description: 'Heart and cardiovascular system', icon: '❤️' },
    { id: 'dermatology', name: 'Dermatology', description: 'Skin, hair, and nails', icon: '🔬' },
    { id: 'neurology', name: 'Neurology', description: 'Brain and nervous system', icon: '🧠' },
    { id: 'pediatrics', name: 'Pediatrics', description: 'Children\'s health', icon: '👶' },
    { id: 'psychiatry', name: 'Psychiatry', description: 'Mental health', icon: '🧘' },
    { id: 'orthopedics', name: 'Orthopedics', description: 'Bones and joints', icon: '🦴' },
    { id: 'ophthalmology', name: 'Ophthalmology', description: 'Eye care', icon: '👁️' }
  ];

  // Create sample doctors
  const doctors = [
    {
      id: 'doc1',
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      specialty: 'cardiology',
      docAddress: 'Main Medical Center',
      tel: '+216-00-000-001',
      verified: true,
      role: USER_ROLES.DOCTOR,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'doc2',
      name: 'Jane',
      surname: 'Smith',
      email: 'jane.smith@example.com',
      specialty: 'pediatrics',
      docAddress: 'Main Medical Center',
      tel: '+216-00-000-002',
      verified: true,
      role: USER_ROLES.DOCTOR,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Create sample patients
  const patients = [
    {
      id: 'pat1',
      name: 'Alice',
      surname: 'Johnson',
      email: 'alice.j@example.com',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'female',
      phone: '+216-00-000-003',
      address: '456 Patient St',
      role: USER_ROLES.PATIENT,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Create sample appointments
  const appointments = [
    {
      id: 'apt1',
      patientId: 'pat1',
      doctorId: 'doc1',
      appointmentDue: new Date(Date.now() + 86400000), // Tomorrow
      status: APPOINTMENT_STATUS.PENDING,
      specialty: 'cardiology',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Create sample medical records
  const medicalRecords = [
    {
      id: 'rec1',
      patientId: 'pat1',
      doctorId: 'doc1',
      diagnosis: 'Regular checkup',
      treatment: 'No treatment needed',
      notes: 'Patient is in good health',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Create base clinics
  const clinics = [
    {
      id: 'main-clinic',
      name: 'Main Medical Center',
      address: '123 Medical Drive',
      city: 'Tunis',
      phone: '+216-00-000-000',
      email: 'contact@mainmedical.com',
      coordinates: { lat: 36.8065, lng: 10.1815 },
      workingHours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '17:00' },
        saturday: { open: '09:00', close: '13:00' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    // Add all collections to batch
    const collections = {
      [COLLECTIONS.SPECIALTIES]: specialties,
      [COLLECTIONS.CLINICS]: clinics,
      [COLLECTIONS.DOCTORS]: doctors,
      [COLLECTIONS.PATIENTS]: patients,
      [COLLECTIONS.APPOINTMENTS]: appointments,
      [COLLECTIONS.MEDICAL_RECORDS]: medicalRecords
    };

    // Create all collections and documents
    for (const [collectionName, documents] of Object.entries(collections)) {
      console.log(`Creating ${collectionName} collection...`);
      documents.forEach((document) => {
        const ref = doc(collection(db, collectionName), document.id);
        batch.set(ref, document);
      });
    }

    await batch.commit();
    console.log('All collections created successfully');
  } catch (error) {
    console.error('Error creating collections:', error);
    throw error;
  }
};

const createIndexes = async () => {
  try {
    // These are the indexes we need
    const indexes = [
      {
        collection: COLLECTIONS.APPOINTMENTS,
        fields: [
          ['patientId', 'asc'],
          ['appointmentDue', 'asc']
        ]
      },
      {
        collection: COLLECTIONS.APPOINTMENTS,
        fields: [
          ['doctorId', 'asc'],
          ['appointmentDue', 'asc']
        ]
      },
      {
        collection: COLLECTIONS.MEDICAL_RECORDS,
        fields: [
          ['patientId', 'asc'],
          ['createdAt', 'desc']
        ]
      },
      {
        collection: COLLECTIONS.DOCTORS,
        fields: [
          ['specialty', 'asc'],
          ['verified', 'asc']
        ]
      }
    ];

    console.log('Creating indexes...');
    // Note: In production, you would use the Firebase Admin SDK to create indexes programmatically
    console.log('Please create the following indexes in Firebase Console:');
    indexes.forEach(index => {
      console.log(`\nCollection: ${index.collection}`);
      console.log('Fields:', index.fields.map(f => `${f[0]} ${f[1]}`).join(', '));
    });
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
};

export const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    await createCollections();
    await createIndexes();
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};