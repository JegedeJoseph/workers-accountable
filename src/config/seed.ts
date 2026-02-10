import mongoose from 'mongoose';
import config from './index';
import { User } from '../models';
import { UserRole, ExcoPosition } from '../types/enums';
import { EXECUTIVES_SEED_DATA } from './executives.seed';

/**
 * Determine the role based on executive position
 * GC (General Coordinator) gets SUPER_ADMIN role
 */
const getRoleForPosition = (position: ExcoPosition): UserRole => {
  if (position === ExcoPosition.GENERAL_COORDINATOR) {
    return UserRole.SUPER_ADMIN;
  }
  return UserRole.EXECUTIVE;
};

/**
 * Seed executives into the database
 * Uses upsert to update existing records or create new ones
 */
const seedExecutives = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    console.log('\n🌱 Starting executive seeding (upsert mode)...\n');

    let created = 0;
    let updated = 0;

    for (const execData of EXECUTIVES_SEED_DATA) {
      // Determine role (GC gets SUPER_ADMIN)
      const role = getRoleForPosition(execData.excoPosition);

      // Check if executive already exists
      const existingExec = await User.findOne({ 
        $or: [
          { email: execData.email },
          { excoPosition: execData.excoPosition }
        ]
      });

      if (existingExec) {
        // Update existing executive (without changing password if already set)
        await User.findByIdAndUpdate(existingExec._id, {
          fullName: execData.fullName,
          email: execData.email,
          phoneNumber: execData.phoneNumber,
          gender: execData.gender,
          excoPosition: execData.excoPosition,
          role: role,
          isActive: true,
        });
        const roleLabel = role === UserRole.SUPER_ADMIN ? '👑 Super Admin' : '📋 Executive';
        console.log(`🔄 Updated ${execData.fullName} (${execData.excoPosition}) - ${roleLabel}`);
        updated++;
      } else {
        // Create new executive user
        // Note: Password will be hashed by the User model pre-save middleware
        await User.create({
          fullName: execData.fullName,
          email: execData.email,
          phoneNumber: execData.phoneNumber,
          gender: execData.gender,
          password: execData.defaultPassword,
          role: role,
          excoPosition: execData.excoPosition,
          isActive: true,
          mustChangePassword: true, // Force password change on first login
        });
        const roleLabel = role === UserRole.SUPER_ADMIN ? '👑 Super Admin' : '📋 Executive';
        console.log(`✅ Created ${execData.fullName} (${execData.excoPosition}) - ${roleLabel}`);
        created++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Seeding Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   📋 Total Executives: ${EXECUTIVES_SEED_DATA.length}`);
    console.log('='.repeat(50));

    console.log('\n🔐 Default Login Credentials (for new accounts):');
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
