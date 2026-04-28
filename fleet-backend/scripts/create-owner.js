/**
 * Create a Fleet Owner account
 * Run: node scripts/create-owner.js
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

// ── Owner Data ────────────────────────────────────────────────────────────────
const OWNER_DATA = {
  name: 'Fleet Owner',
  email: 'owner1@gmail.com',
  password: '1234567890',
  phone: '+919876543200'
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  Creating Fleet Owner account...\n');

  const normalEmail = OWNER_DATA.email.toLowerCase().trim();

  // Check if owner already exists
  const existingUser = await db.collection('users')
    .where('email', '==', normalEmail).limit(1).get();

  if (!existingUser.empty) {
    const existingUid = existingUser.docs[0].id;
    console.log(`✅  Owner already exists: ${normalEmail}`);
    console.log(`    UID: ${existingUid}`);
    console.log(`    Email: ${normalEmail}`);
    console.log(`    Password: ${OWNER_DATA.password}\n`);
    console.log('🎉  You can now run: node scripts/seed-drivers.js');
    process.exit(0);
  }

  try {
    // Create Firebase Auth account
    const authUser = await admin.auth().createUser({
      email: normalEmail,
      password: OWNER_DATA.password,
      displayName: OWNER_DATA.name,
      emailVerified: true
    });

    const uid = authUser.uid;
    const now = admin.firestore.FieldValue.serverTimestamp();

    // Create users doc
    await db.collection('users').doc(uid).set({
      uid,
      name: OWNER_DATA.name,
      email: normalEmail,
      phone: OWNER_DATA.phone,
      role: 'owner',
      disabled: false,
      avatarInitials: 'FO',
      createdAt: now,
      updatedAt: now
    });

    console.log('✅  Fleet Owner created successfully!\n');
    console.log('📋  Login Credentials:');
    console.log(`    Email: ${normalEmail}`);
    console.log(`    Password: ${OWNER_DATA.password}`);
    console.log(`    UID: ${uid}\n`);
    console.log('🎉  Next steps:');
    console.log('    1. node scripts/seed-drivers.js');
    console.log('    2. node scripts/seed-trucks-ml.js');
    console.log('    3. node scripts/seed.js (for earnings & insurance)\n');

    process.exit(0);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      console.error('❌  Email already exists in Firebase Auth but not in Firestore.');
      console.error('    Please check your Firebase Console or use a different email.');
    } else {
      console.error('❌  Failed to create owner:', err.message);
    }
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌  Script failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
