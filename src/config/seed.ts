import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './index';
import { User } from '../models';
import { UserRole } from '../types/enums';
import { EXECUTIVES_SEED_DATA } from './executives.seed';

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
          role: UserRole.EXECUTIVE,
          isActive: true,
        });
        console.log(`🔄 Updated ${execData.fullName} (${execData.excoPosition})`);
        updated++;
      } else {
        // Create new executive user
        const hashedPassword = await bcrypt.hash(execData.defaultPassword, 12);
        
        await User.create({
          fullName: execData.fullName,
          email: execData.email,
          phoneNumber: execData.phoneNumber,
          gender: execData.gender,
          password: hashedPassword,
          role: UserRole.EXECUTIVE,
          excoPosition: execData.excoPosition,
          isActive: true,
          mustChangePassword: true, // Force password change on first login
        });
        console.log(`✅ Created ${execData.fullName} (${execData.excoPosition})`);
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
