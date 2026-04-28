/**
 * Seed script for trucks with ML-ready performance metrics
 * Run: node scripts/seed-trucks-ml.js
 * 
 * Adds/updates trucks with performance data for ML model:
 * - maintenance_score (0-100, higher is better)
 * - fuel_efficiency (km/liter, typically 3-8 for trucks)
 * - breakdown_count (number of breakdowns)
 * - age_years (vehicle age)
 * - total_trips (total trips completed)
 * - avg_load_capacity_used (percentage, 0-100)
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

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

// ── Sample Truck Data ─────────────────────────────────────────────────────────
const SAMPLE_TRUCKS = [
  // Excellent Trucks (5)
  {
    plate: 'MH-01-AB-1234',
    model: 'Tata LPT 1613',
    type: 'Medium Truck',
    year: 2020,
    maintenance_score: 92,
    fuel_efficiency: 6.8,
    breakdown_count: 1,
    age_years: 4,
    total_trips: 520,
    avg_load_capacity_used: 85
  },
  {
    plate: 'GJ-03-EF-9012',
    model: 'Mahindra Blazo X 35',
    type: 'Heavy Truck',
    year: 2021,
    maintenance_score: 95,
    fuel_efficiency: 7.2,
    breakdown_count: 0,
    age_years: 3,
    total_trips: 420,
    avg_load_capacity_used: 90
  },
  {
    plate: 'UP-06-KL-2345',
    model: 'BharatBenz 1617R',
    type: 'Medium Truck',
    year: 2022,
    maintenance_score: 98,
    fuel_efficiency: 7.5,
    breakdown_count: 0,
    age_years: 2,
    total_trips: 180,
    avg_load_capacity_used: 88
  },
  {
    plate: 'KA-09-PQ-4567',
    model: 'Volvo FH16',
    type: 'Heavy Truck',
    year: 2021,
    maintenance_score: 94,
    fuel_efficiency: 7.0,
    breakdown_count: 1,
    age_years: 3,
    total_trips: 380,
    avg_load_capacity_used: 87
  },
  {
    plate: 'TN-10-RS-7890',
    model: 'Ashok Leyland 2820',
    type: 'Heavy Truck',
    year: 2020,
    maintenance_score: 91,
    fuel_efficiency: 6.9,
    breakdown_count: 1,
    age_years: 4,
    total_trips: 490,
    avg_load_capacity_used: 86
  },

  // Good Trucks (8)
  {
    plate: 'RJ-05-IJ-7890',
    model: 'Tata Signa 4825',
    type: 'Heavy Truck',
    year: 2020,
    maintenance_score: 88,
    fuel_efficiency: 6.5,
    breakdown_count: 2,
    age_years: 4,
    total_trips: 460,
    avg_load_capacity_used: 82
  },
  {
    plate: 'MH-08-OP-0123',
    model: 'Tata Ultra T.7',
    type: 'Light Truck',
    year: 2021,
    maintenance_score: 85,
    fuel_efficiency: 6.2,
    breakdown_count: 2,
    age_years: 3,
    total_trips: 240,
    avg_load_capacity_used: 78
  },
  {
    plate: 'DL-11-TU-1234',
    model: 'Eicher Pro 6025',
    type: 'Medium Truck',
    year: 2019,
    maintenance_score: 84,
    fuel_efficiency: 6.0,
    breakdown_count: 3,
    age_years: 5,
    total_trips: 410,
    avg_load_capacity_used: 80
  },
  {
    plate: 'GJ-12-VW-5678',
    model: 'Tata LPT 2518',
    type: 'Heavy Truck',
    year: 2020,
    maintenance_score: 86,
    fuel_efficiency: 6.3,
    breakdown_count: 2,
    age_years: 4,
    total_trips: 440,
    avg_load_capacity_used: 81
  },
  {
    plate: 'MH-13-XY-9012',
    model: 'Mahindra Furio 14',
    type: 'Medium Truck',
    year: 2021,
    maintenance_score: 87,
    fuel_efficiency: 6.4,
    breakdown_count: 2,
    age_years: 3,
    total_trips: 310,
    avg_load_capacity_used: 79
  },
  {
    plate: 'KA-14-ZA-3456',
    model: 'BharatBenz 1415R',
    type: 'Medium Truck',
    year: 2019,
    maintenance_score: 83,
    fuel_efficiency: 5.9,
    breakdown_count: 3,
    age_years: 5,
    total_trips: 390,
    avg_load_capacity_used: 77
  },
  {
    plate: 'TN-15-BC-7890',
    model: 'Ashok Leyland 1920',
    type: 'Medium Truck',
    year: 2020,
    maintenance_score: 85,
    fuel_efficiency: 6.1,
    breakdown_count: 3,
    age_years: 4,
    total_trips: 370,
    avg_load_capacity_used: 78
  },
  {
    plate: 'RJ-16-DE-2345',
    model: 'Tata 1109',
    type: 'Light Truck',
    year: 2021,
    maintenance_score: 86,
    fuel_efficiency: 6.2,
    breakdown_count: 2,
    age_years: 3,
    total_trips: 280,
    avg_load_capacity_used: 76
  },

  // Average Trucks (7)
  {
    plate: 'DL-02-CD-5678',
    model: 'Ashok Leyland 1616',
    type: 'Medium Truck',
    year: 2019,
    maintenance_score: 78,
    fuel_efficiency: 5.5,
    breakdown_count: 5,
    age_years: 5,
    total_trips: 380,
    avg_load_capacity_used: 72
  },
  {
    plate: 'UP-17-FG-6789',
    model: 'Eicher Pro 3015',
    type: 'Light Truck',
    year: 2018,
    maintenance_score: 75,
    fuel_efficiency: 5.3,
    breakdown_count: 6,
    age_years: 6,
    total_trips: 320,
    avg_load_capacity_used: 70
  },
  {
    plate: 'MH-18-HI-0123',
    model: 'Tata 407',
    type: 'Light Truck',
    year: 2019,
    maintenance_score: 76,
    fuel_efficiency: 5.4,
    breakdown_count: 5,
    age_years: 5,
    total_trips: 290,
    avg_load_capacity_used: 71
  },
  {
    plate: 'GJ-19-JK-4567',
    model: 'Mahindra Bolero Pik-Up',
    type: 'Light Truck',
    year: 2020,
    maintenance_score: 74,
    fuel_efficiency: 5.2,
    breakdown_count: 6,
    age_years: 4,
    total_trips: 250,
    avg_load_capacity_used: 68
  },
  {
    plate: 'KA-20-LM-8901',
    model: 'Ashok Leyland Dost',
    type: 'Light Truck',
    year: 2019,
    maintenance_score: 77,
    fuel_efficiency: 5.5,
    breakdown_count: 5,
    age_years: 5,
    total_trips: 300,
    avg_load_capacity_used: 72
  },
  {
    plate: 'TN-21-NO-2345',
    model: 'Tata Ace',
    type: 'Light Truck',
    year: 2020,
    maintenance_score: 73,
    fuel_efficiency: 5.1,
    breakdown_count: 7,
    age_years: 4,
    total_trips: 230,
    avg_load_capacity_used: 67
  },
  {
    plate: 'DL-22-PQ-6789',
    model: 'Eicher Pro 1049',
    type: 'Light Truck',
    year: 2018,
    maintenance_score: 75,
    fuel_efficiency: 5.3,
    breakdown_count: 6,
    age_years: 6,
    total_trips: 310,
    avg_load_capacity_used: 69
  },

  // Below Average Trucks (5)
  {
    plate: 'KA-04-GH-3456',
    model: 'Eicher Pro 3015',
    type: 'Light Truck',
    year: 2018,
    maintenance_score: 65,
    fuel_efficiency: 4.8,
    breakdown_count: 8,
    age_years: 6,
    total_trips: 280,
    avg_load_capacity_used: 65
  },
  {
    plate: 'TN-07-MN-6789',
    model: 'Volvo FM 440',
    type: 'Heavy Truck',
    year: 2017,
    maintenance_score: 70,
    fuel_efficiency: 5.2,
    breakdown_count: 6,
    age_years: 7,
    total_trips: 620,
    avg_load_capacity_used: 75
  },
  {
    plate: 'RJ-23-RS-0123',
    model: 'Tata 709',
    type: 'Light Truck',
    year: 2017,
    maintenance_score: 62,
    fuel_efficiency: 4.6,
    breakdown_count: 9,
    age_years: 7,
    total_trips: 270,
    avg_load_capacity_used: 63
  },
  {
    plate: 'UP-24-TU-4567',
    model: 'Ashok Leyland Partner',
    type: 'Light Truck',
    year: 2016,
    maintenance_score: 60,
    fuel_efficiency: 4.5,
    breakdown_count: 10,
    age_years: 8,
    total_trips: 240,
    avg_load_capacity_used: 60
  },
  {
    plate: 'MH-25-VW-8901',
    model: 'Mahindra Jeeto',
    type: 'Light Truck',
    year: 2017,
    maintenance_score: 64,
    fuel_efficiency: 4.7,
    breakdown_count: 9,
    age_years: 7,
    total_trips: 210,
    avg_load_capacity_used: 62
  }
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  Starting truck seed with ML performance metrics...\n');

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

  // 2. Check existing trucks
  const existingTrucks = await db.collection('trucks')
    .where('ownerId', '==', ownerId).get();
  
  console.log(`📊  Found ${existingTrucks.size} existing truck(s)\n`);

  // 3. Create/update trucks with performance metrics
  const now = admin.firestore.FieldValue.serverTimestamp();
  let created = 0;
  let updated = 0;

  for (const truckData of SAMPLE_TRUCKS) {
    const plateUpper = truckData.plate.toUpperCase();
    
    // Check if truck already exists by plate
    const existingByPlate = await db.collection('trucks')
      .where('plate', '==', plateUpper).limit(1).get();

    if (!existingByPlate.empty) {
      // Update existing truck with performance metrics
      const truckDoc = existingByPlate.docs[0];
      await truckDoc.ref.update({
        maintenance_score: truckData.maintenance_score,
        fuel_efficiency: truckData.fuel_efficiency,
        breakdown_count: truckData.breakdown_count,
        age_years: truckData.age_years,
        total_trips: truckData.total_trips,
        avg_load_capacity_used: truckData.avg_load_capacity_used,
        updatedAt: now
      });
      console.log(`🔄  Updated: ${plateUpper} (${truckData.model})`);
      updated++;
      continue;
    }

    // Create new truck
    const truckId = uuidv4();
    await db.collection('trucks').doc(truckId).set({
      truckId,
      ownerId,
      plate: plateUpper,
      model: truckData.model,
      type: truckData.type,
      year: truckData.year,
      status: 'idle',
      assignedDriverId: null,
      lastLocation: null,
      lastSeen: null,
      // ML Performance Metrics
      maintenance_score: truckData.maintenance_score,
      fuel_efficiency: truckData.fuel_efficiency,
      breakdown_count: truckData.breakdown_count,
      age_years: truckData.age_years,
      total_trips: truckData.total_trips,
      avg_load_capacity_used: truckData.avg_load_capacity_used,
      createdAt: now,
      updatedAt: now
    });

    console.log(`✅  Created: ${plateUpper} (${truckData.model})`);
    created++;
  }

  console.log('\n📈  Summary:');
  console.log(`   ✅  Created: ${created}`);
  console.log(`   🔄  Updated: ${updated}`);
  console.log('\n🎉  Truck seed complete!');
  console.log('\n📝  Next steps:');
  console.log('   1. Create train_truck_model.py (similar to train_driver_model.py)');
  console.log('   2. Train the truck model');
  console.log('   3. Add truck prediction endpoint to ML API\n');

  process.exit(0);
}

main().catch(err => {
  console.error('❌  Seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
