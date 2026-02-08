import mongoose from 'mongoose';
import config from './index';
import { User } from '../models';
import { UserRole } from '../types/enums';
import { EXECUTIVES_SEED_DATA } from './executives.seed';

/**
 * Seed executives into the database
 * Run this script once to populate executive accounts
 */
const seedExecutives = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    console.log('\n🌱 Starting executive seeding...\n');

    let created = 0;
    let skipped = 0;

    for (const execData of EXECUTIVES_SEED_DATA) {
      // Check if executive already exists
      const existingExec = await User.findOne({ email: execData.email });

      if (existingExec) {
        console.log(`⏭️  Skipping ${execData.fullName} (${execData.excoPosition}) - already exists`);
        skipped++;
        continue;
      }

      // Create executive user
      const executive = new User({
        fullName: execData.fullName,
        email: execData.email,
        phoneNumber: execData.phoneNumber,
        gender: execData.gender,
        password: execData.defaultPassword, // Will be hashed by pre-save hook
        role: UserRole.EXECUTIVE,
        excoPosition: execData.excoPosition,
        isActive: true,
        mustChangePassword: true, // Force password change on first login
      });

      await executive.save();
      console.log(`✅ Created ${execData.fullName} (${execData.excoPosition})`);
      created++;
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Seeding Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📋 Total Executives: ${EXECUTIVES_SEED_DATA.length}`);
    console.log('='.repeat(50));

    console.log('\n🔐 Default Login Credentials:');
    console.log('   Password: AUChapel@2026');
    console.log('   ⚠️  Executives should change password on first login!\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run seeder if executed directly
if (require.main === module) {
  seedExecutives()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedExecutives };
