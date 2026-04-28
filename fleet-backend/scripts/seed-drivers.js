/**
 * Seed script for drivers with ML-ready performance metrics
 * Run: node scripts/seed-drivers.js
 * 
 * Adds realistic performance data for ML model training:
 * - safety_score (0-100)
 * - on_time_delivery_rate (0-100)
 * - fuel_efficiency (km/liter, typically 3-8 for trucks)
 * - alert_count (number of safety alerts)
 * - experience_years (years of driving experience)
 * - trips_completed (total trips completed)
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

// ── Init Firebase ─────────────────────────────────────────────────────────────
const keyPath = path.resolve(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('❌  serviceAccountKey.json not found at', keyPath);
  process.exit(1);
}
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(keyPath, 'utf8')))
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// ── Helpers ───────────────────────────────────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

// ── Sample Driver Data ────────────────────────────────────────────────────────
const SAMPLE_DRIVERS = [
  // Excellent Performers (5)
  {
    name: 'Rajesh Kumar',
    phone: '+919876543210',
    email: 'rajesh.kumar@fleet.com',
    licenseNumber: 'DL-01-2018-0012345',
    licenseExpiry: '2027-06-15',
    safety_score: 92,
    on_time_delivery_rate: 88,
    fuel_efficiency: 6.5,
    alert_count: 2,
    experience_years: 8,
    trips_completed: 450
  },
  {
    name: 'Suresh Patel',
    phone: '+919876543212',
    email: 'suresh.patel@fleet.com',
    licenseNumber: 'DL-03-2015-0034567',
    licenseExpiry: '2026-11-10',
    safety_score: 95,
    on_time_delivery_rate: 94,
    fuel_efficiency: 7.2,
    alert_count: 1,
    experience_years: 12,
    trips_completed: 820
  },
  {
    name: 'Ramesh Gupta',
    phone: '+919876543216',
    email: 'ramesh.gupta@fleet.com',
    licenseNumber: 'DL-07-2014-0078901',
    licenseExpiry: '2026-04-18',
    safety_score: 88,
    on_time_delivery_rate: 90,
    fuel_efficiency: 6.8,
    alert_count: 3,
    experience_years: 10,
    trips_completed: 650
  },
  {
    name: 'Harish Reddy',
    phone: '+919876543218',
    email: 'harish.reddy@fleet.com',
    licenseNumber: 'DL-09-2016-0090123',
    licenseExpiry: '2027-07-22',
    safety_score: 93,
    on_time_delivery_rate: 91,
    fuel_efficiency: 7.0,
    alert_count: 2,
    experience_years: 9,
    trips_completed: 580
  },
  {
    name: 'Prakash Nair',
    phone: '+919876543219',
    email: 'prakash.nair@fleet.com',
    licenseNumber: 'DL-10-2015-0101234',
    licenseExpiry: '2026-12-08',
    safety_score: 90,
    on_time_delivery_rate: 89,
    fuel_efficiency: 6.9,
    alert_count: 2,
    experience_years: 11,
    trips_completed: 720
  },
  
  // Good Performers (8)
  {
    name: 'Manoj Verma',
    phone: '+919876543214',
    email: 'manoj.verma@fleet.com',
    licenseNumber: 'DL-05-2017-0056789',
    licenseExpiry: '2027-01-30',
    safety_score: 85,
    on_time_delivery_rate: 82,
    fuel_efficiency: 6.0,
    alert_count: 4,
    experience_years: 7,
    trips_completed: 380
  },
  {
    name: 'Sanjay Desai',
    phone: '+919876543220',
    email: 'sanjay.desai@fleet.com',
    licenseNumber: 'DL-11-2018-0112345',
    licenseExpiry: '2027-05-14',
    safety_score: 84,
    on_time_delivery_rate: 80,
    fuel_efficiency: 6.2,
    alert_count: 5,
    experience_years: 6,
    trips_completed: 340
  },
  {
    name: 'Ravi Shankar',
    phone: '+919876543221',
    email: 'ravi.shankar@fleet.com',
    licenseNumber: 'DL-12-2017-0123456',
    licenseExpiry: '2027-03-19',
    safety_score: 82,
    on_time_delivery_rate: 78,
    fuel_efficiency: 5.8,
    alert_count: 6,
    experience_years: 7,
    trips_completed: 410
  },
  {
    name: 'Kiran Kumar',
    phone: '+919876543222',
    email: 'kiran.kumar@fleet.com',
    licenseNumber: 'DL-13-2019-0134567',
    licenseExpiry: '2028-01-25',
    safety_score: 86,
    on_time_delivery_rate: 83,
    fuel_efficiency: 6.3,
    alert_count: 4,
    experience_years: 5,
    trips_completed: 290
  },
  {
    name: 'Dinesh Pillai',
    phone: '+919876543223',
    email: 'dinesh.pillai@fleet.com',
    licenseNumber: 'DL-14-2016-0145678',
    licenseExpiry: '2026-09-30',
    safety_score: 83,
    on_time_delivery_rate: 81,
    fuel_efficiency: 6.1,
    alert_count: 5,
    experience_years: 8,
    trips_completed: 480
  },
  {
    name: 'Ashok Mehta',
    phone: '+919876543224',
    email: 'ashok.mehta@fleet.com',
    licenseNumber: 'DL-15-2018-0156789',
    licenseExpiry: '2027-11-12',
    safety_score: 87,
    on_time_delivery_rate: 84,
    fuel_efficiency: 6.4,
    alert_count: 3,
    experience_years: 6,
    trips_completed: 360
  },
  {
    name: 'Gopal Rao',
    phone: '+919876543225',
    email: 'gopal.rao@fleet.com',
    licenseNumber: 'DL-16-2017-0167890',
    licenseExpiry: '2027-08-07',
    safety_score: 81,
    on_time_delivery_rate: 79,
    fuel_efficiency: 5.9,
    alert_count: 6,
    experience_years: 7,
    trips_completed: 420
  },
  {
    name: 'Mohan Das',
    phone: '+919876543226',
    email: 'mohan.das@fleet.com',
    licenseNumber: 'DL-17-2019-0178901',
    licenseExpiry: '2028-04-16',
    safety_score: 85,
    on_time_delivery_rate: 82,
    fuel_efficiency: 6.0,
    alert_count: 4,
    experience_years: 5,
    trips_completed: 310
  },

  // Average Performers (7)
  {
    name: 'Amit Singh',
    phone: '+919876543211',
    email: 'amit.singh@fleet.com',
    licenseNumber: 'DL-02-2020-0023456',
    licenseExpiry: '2028-03-20',
    safety_score: 78,
    on_time_delivery_rate: 72,
    fuel_efficiency: 5.2,
    alert_count: 8,
    experience_years: 4,
    trips_completed: 180
  },
  {
    name: 'Deepak Yadav',
    phone: '+919876543215',
    email: 'deepak.yadav@fleet.com',
    licenseNumber: 'DL-06-2021-0067890',
    licenseExpiry: '2028-09-12',
    safety_score: 70,
    on_time_delivery_rate: 75,
    fuel_efficiency: 5.5,
    alert_count: 10,
    experience_years: 3,
    trips_completed: 95
  },
  {
    name: 'Naveen Chandra',
    phone: '+919876543227',
    email: 'naveen.chandra@fleet.com',
    licenseNumber: 'DL-18-2020-0189012',
    licenseExpiry: '2028-06-21',
    safety_score: 75,
    on_time_delivery_rate: 73,
    fuel_efficiency: 5.3,
    alert_count: 9,
    experience_years: 4,
    trips_completed: 210
  },
  {
    name: 'Santosh Iyer',
    phone: '+919876543228',
    email: 'santosh.iyer@fleet.com',
    licenseNumber: 'DL-19-2021-0190123',
    licenseExpiry: '2029-01-15',
    safety_score: 72,
    on_time_delivery_rate: 70,
    fuel_efficiency: 5.1,
    alert_count: 11,
    experience_years: 3,
    trips_completed: 140
  },
  {
    name: 'Bala Krishna',
    phone: '+919876543229',
    email: 'bala.krishna@fleet.com',
    licenseNumber: 'DL-20-2020-0201234',
    licenseExpiry: '2028-10-28',
    safety_score: 76,
    on_time_delivery_rate: 74,
    fuel_efficiency: 5.4,
    alert_count: 9,
    experience_years: 4,
    trips_completed: 195
  },
  {
    name: 'Sunil Jain',
    phone: '+919876543230',
    email: 'sunil.jain@fleet.com',
    licenseNumber: 'DL-21-2019-0212345',
    licenseExpiry: '2028-02-11',
    safety_score: 74,
    on_time_delivery_rate: 71,
    fuel_efficiency: 5.2,
    alert_count: 10,
    experience_years: 5,
    trips_completed: 260
  },
  {
    name: 'Ajay Malhotra',
    phone: '+919876543231',
    email: 'ajay.malhotra@fleet.com',
    licenseNumber: 'DL-22-2021-0223456',
    licenseExpiry: '2029-03-05',
    safety_score: 73,
    on_time_delivery_rate: 69,
    fuel_efficiency: 5.0,
    alert_count: 12,
    experience_years: 3,
    trips_completed: 125
  },

  // Below Average Performers (5)
  {
    name: 'Vikram Sharma',
    phone: '+919876543213',
    email: 'vikram.sharma@fleet.com',
    licenseNumber: 'DL-04-2019-0045678',
    licenseExpiry: '2027-08-25',
    safety_score: 65,
    on_time_delivery_rate: 68,
    fuel_efficiency: 4.8,
    alert_count: 15,
    experience_years: 5,
    trips_completed: 220
  },
  {
    name: 'Anil Joshi',
    phone: '+919876543217',
    email: 'anil.joshi@fleet.com',
    licenseNumber: 'DL-08-2022-0089012',
    licenseExpiry: '2029-02-05',
    safety_score: 60,
    on_time_delivery_rate: 65,
    fuel_efficiency: 4.5,
    alert_count: 18,
    experience_years: 2,
    trips_completed: 45
  },
  {
    name: 'Rahul Kapoor',
    phone: '+919876543232',
    email: 'rahul.kapoor@fleet.com',
    licenseNumber: 'DL-23-2022-0234567',
    licenseExpiry: '2029-05-18',
    safety_score: 62,
    on_time_delivery_rate: 66,
    fuel_efficiency: 4.6,
    alert_count: 17,
    experience_years: 2,
    trips_completed: 68
  },
  {
    name: 'Pankaj Saxena',
    phone: '+919876543233',
    email: 'pankaj.saxena@fleet.com',
    licenseNumber: 'DL-24-2021-0245678',
    licenseExpiry: '2028-12-22',
    safety_score: 64,
    on_time_delivery_rate: 67,
    fuel_efficiency: 4.7,
    alert_count: 16,
    experience_years: 3,
    trips_completed: 110
  },
  {
    name: 'Rohit Bhatt',
    phone: '+919876543234',
    email: 'rohit.bhatt@fleet.com',
    licenseNumber: 'DL-25-2022-0256789',
    licenseExpiry: '2029-07-09',
    safety_score: 58,
    on_time_delivery_rate: 63,
    fuel_efficiency: 4.4,
    alert_count: 20,
    experience_years: 2,
    trips_completed: 52
  }
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  Starting driver seed with ML performance metrics...\n');

  // 1. Find owner
  const trucksSnap = await db.collection('trucks').limit(1).get();
  let ownerId = null;

  if (!trucksSnap.empty) {
    ownerId = trucksSnap.docs[0].data().ownerId;
    console.log(`✅  Detected owner from trucks: ${ownerId}`);
  } else {
    const ownerSnap = await db.collection('users')
      .where('role', 'in', ['owner', 'Fleet Owner']).limit(1).get();
    if (!ownerSnap.empty) {
      ownerId = ownerSnap.docs[0].data().uid;
      console.log(`✅  Owner from users collection: ${ownerId}`);
    }
  }

  if (!ownerId) {
    console.error('❌  No owner found. Sign up as Fleet Owner in the app first.');
    process.exit(1);
  }

  // 2. Check existing drivers
  const existingDrivers = await db.collection('drivers')
    .where('ownerId', '==', ownerId).get();
  
  console.log(`📊  Found ${existingDrivers.size} existing driver(s)\n`);

  // 3. Create drivers with performance metrics
  const now = admin.firestore.FieldValue.serverTimestamp();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const driverData of SAMPLE_DRIVERS) {
    const normalEmail = driverData.email.toLowerCase().trim();
    
    // Check if driver already exists by email
    const existingByEmail = await db.collection('users')
      .where('email', '==', normalEmail).limit(1).get();

    if (!existingByEmail.empty) {
      // Update existing driver with performance metrics
      const existingUid = existingByEmail.docs[0].id;
      const driverDoc = await db.collection('drivers').doc(existingUid).get();
      
      if (driverDoc.exists) {
        await driverDoc.ref.update({
          safety_score: driverData.safety_score,
          on_time_delivery_rate: driverData.on_time_delivery_rate,
          fuel_efficiency: driverData.fuel_efficiency,
          alert_count: driverData.alert_count,
          experience_years: driverData.experience_years,
          trips_completed: driverData.trips_completed,
          updatedAt: now
        });
        console.log(`🔄  Updated: ${driverData.name} (${normalEmail})`);
        updated++;
      } else {
        console.log(`⚠️   Skipped: ${driverData.name} - user exists but no driver record`);
        skipped++;
      }
      continue;
    }

    // Create new driver
    try {
      const tempPassword = _generatePassword();
      
      // Create Firebase Auth account
      const authUser = await admin.auth().createUser({
        email: normalEmail,
        password: tempPassword,
        displayName: driverData.name,
        emailVerified: false
      });

      const uid = authUser.uid;

      // Create users doc
      await db.collection('users').doc(uid).set({
        uid,
        name: driverData.name,
        email: normalEmail,
        phone: driverData.phone,
        role: 'driver',
        disabled: false,
        avatarInitials: _initials(driverData.name),
        createdAt: now,
        updatedAt: now
      });

      // Create drivers doc with performance metrics
      await db.collection('drivers').doc(uid).set({
        driverId: uid,
        ownerId,
        uid,
        name: driverData.name,
        email: normalEmail,
        phone: driverData.phone,
        licenseNumber: driverData.licenseNumber,
        licenseExpiry: driverData.licenseExpiry,
        assignedTruckId: null,
        status: 'available',
        // ML Performance Metrics
        safety_score: driverData.safety_score,
        on_time_delivery_rate: driverData.on_time_delivery_rate,
        fuel_efficiency: driverData.fuel_efficiency,
        alert_count: driverData.alert_count,
        experience_years: driverData.experience_years,
        trips_completed: driverData.trips_completed,
        createdAt: now,
        updatedAt: now
      });

      console.log(`✅  Created: ${driverData.name} (${normalEmail}) - Password: ${tempPassword}`);
      created++;
    } catch (err) {
      console.error(`❌  Failed to create ${driverData.name}:`, err.message);
      skipped++;
    }
  }

  console.log('\n📈  Summary:');
  console.log(`   ✅  Created: ${created}`);
  console.log(`   🔄  Updated: ${updated}`);
  console.log(`   ⚠️   Skipped: ${skipped}`);
  console.log('\n🎉  Driver seed complete!');
  console.log('\n📝  Next steps:');
  console.log('   1. Run: cd ml && python train_driver_model.py');
  console.log('   2. Start ML API: python ml/api.py');
  console.log('   3. Test predictions via your backend\n');

  process.exit(0);
}

function _generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

function _initials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.length > 0 ? name[0].toUpperCase() : '?';
}

main().catch(err => {
  console.error('❌  Seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
