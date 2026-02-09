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
  ASSISTANT_GENERAL_COORDINATOR_FOUNDATION_SCHOOL = 'AGC-FOUNDATION_SCHOOL',
  ASSISTANT_GENERAL_COORDINATOR_HALL_3 = 'AGC-HALL-3',
  ASSISTANT_GENERAL_COORDINATOR_HALL_2 = 'AGC-HALL-2',
  SISTER_WELFARE_COORDINATOR = 'SWC',
  ASSISTANT_SISTER_WELFARE_COORDINATOR_FOUNDATION_SCHOOL = 'ASWC-FOUNDATION_SCHOOL',
  ASSISTANT_SISTER_WELFARE_COORDINATOR_HALL_3 = 'ASWC-HALL-3',
  ASSISTANT_SISTER_WELFARE_COORDINATOR_HALL_2 = 'ASWC-HALL-2',
  FINANCIAL_COORDINATOR = 'FC',
  MAINTENANCE_COORDINATOR = 'MC',
  PRAYER_COORDINATOR = 'PC',
  ACADEMIC_COORDINATOR = 'AC',
  EVANGELISM_COORDINATOR_MALE = 'EC_MALE',
  EVANGELISM_COORDINATOR_FEMALE = 'EC_FEMALE',
  SECRETARIAT_COORDINATOR= 'SC',
  LIBRARY_COORDINATOR = 'LC',
  HEAD_USHER_MALE = 'HEAD-USHER-MALE',
  HEAD_USHER_FEMALE = 'HEAD-USHER-FEMALE',
}

// Token types for JWT
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

// Spiritual Disciplines for Weekly Tracker
export enum SpiritualDiscipline {
  PRAYER = 'prayer',
  BIBLE_STUDY = 'bible_study',
  FASTING = 'fasting',
  EVANGELISM = 'evangelism',
}

// Days of the week
export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

// Export arrays for validation and dropdown population
export const UserRoles = Object.values(UserRole);
export const Genders = Object.values(Gender);
export const MaleHostels = Object.values(MaleHostel);
export const FemaleHostels = Object.values(FemaleHostel);
export const AllHostels = [...MaleHostels, ...FemaleHostels];
export const WorkforceDepartments = Object.values(WorkforceDepartment);
export const ExcoPositions = Object.values(ExcoPosition);
export const SpiritualDisciplines = Object.values(SpiritualDiscipline);
export const DaysOfWeek = Object.values(DayOfWeek);

// Disciplines that are required daily (7 days/week)
export const DailyDisciplines = [SpiritualDiscipline.PRAYER, SpiritualDiscipline.BIBLE_STUDY];

// Disciplines that are required once per week
export const WeeklyDisciplines = [SpiritualDiscipline.FASTING, SpiritualDiscipline.EVANGELISM];

// Default required day for weekly disciplines
export const WeeklyDisciplineDefaults = {
  [SpiritualDiscipline.FASTING]: DayOfWeek.WEDNESDAY,
  [SpiritualDiscipline.EVANGELISM]: DayOfWeek.SUNDAY,
};

/**
 * Helper to get hostels by gender
 */
export const getHostelsByGender = (gender: Gender): string[] => {
  return gender === Gender.MALE ? MaleHostels : FemaleHostels;
};
