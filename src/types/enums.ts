/**
 * Enum definitions for the AU Chapel Workers system
 * Using TypeScript enums for type safety and preventing data entry errors
 */

// User Roles
export enum UserRole {
  WORKER = 'worker',
  EXECUTIVE = 'executive',
}

// Gender options
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

// Male Hostels (Anchor University)
export enum MaleHostel {
  PEACE_HOSTEL = 'PEACE_hostel',
  PROGRESS_HOSTEL = 'PROGRESS_hostel',
}

// Female Hostels (Anchor University)
export enum FemaleHostel {
  PATIENCE_HOSTEL = 'patience_hostel',
  PURITY_HOSTEL = 'purity_hostel',
  PECULIAR_HOSTEL = 'peculiar_hostel',
  GUEST_HOUSE = 'guest_house',
}

// Workforce Departments
export enum WorkforceDepartment {
  CHOIR = 'choir',
  USHERING = 'ushering',
  TECHNICAL = 'technical',
  MEDIA = 'media',
  PRAYER = 'prayer',
  EVANGELISM = 'evangelism',
  WELFARE = 'welfare',
  SANCTUARY = 'sanctuary',
  PROTOCOL = 'protocol',
  CHILDREN = 'children',
  DRAMA = 'drama',
  INSTRUMENTALS = 'instrumentals',
}

// Executive Positions
export enum ExcoPosition {
  GENERAL_COORDINATOR = 'GC',
  ASSISTANT_GENERAL_COORDINATOR_1 = 'AGC-1',
  ASSISTANT_GENERAL_COORDINATOR_2 = 'AGC-2',
  ASSISTANT_GENERAL_COORDINATOR_3 = 'AGC-3',
  SISTER_WELFARE_COORDINATOR = 'SWC',
  ASSISTANT_SISTER_WELFARE_COORDINATOR_1 = 'ASWC-1',
 ASSISTANT_SISTER_WELFARE_COORDINATOR_2 = 'ASWC-2',
 ASSISTANT_SISTER_WELFARE_COORDINATOR_3 = 'ASWC-3',
  FINANCIAL_SECRETARY = 'financial_secretary',
  TREASURER = 'treasurer',
  WELFARE_DIRECTOR = 'welfare_director',
  PRAYER_DIRECTOR = 'prayer_director',
  EVANGELISM_DIRECTOR = 'evangelism_director',
  CHOIR_DIRECTOR = 'choir_director',
  TECHNICAL_DIRECTOR = 'technical_director',
  MEDIA_DIRECTOR = 'media_director',
  PROTOCOL_DIRECTOR = 'protocol_director',
  USHERING_COORDINATOR = 'ushering_coordinator',
  SANCTUARY_COORDINATOR = 'sanctuary_coordinator',
  CHILDREN_COORDINATOR = 'children_coordinator',
  DRAMA_COORDINATOR = 'drama_coordinator',
  INSTRUMENTALS_COORDINATOR = 'instrumentals_coordinator',
}

// Token types for JWT
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

// Export arrays for validation and dropdown population
export const UserRoles = Object.values(UserRole);
export const Genders = Object.values(Gender);
export const MaleHostels = Object.values(MaleHostel);
export const FemaleHostels = Object.values(FemaleHostel);
export const AllHostels = [...MaleHostels, ...FemaleHostels];
export const WorkforceDepartments = Object.values(WorkforceDepartment);
export const ExcoPositions = Object.values(ExcoPosition);

/**
 * Helper to get hostels by gender
 */
export const getHostelsByGender = (gender: Gender): string[] => {
  return gender === Gender.MALE ? MaleHostels : FemaleHostels;
};
