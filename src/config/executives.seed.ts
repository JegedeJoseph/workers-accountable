import { ExcoPosition, Gender } from '../types/enums';

/**
 * Hardcoded Executive Data
 * These executives are pre-seeded into the database with default credentials
 * Workers can select from this list during registration
 */
export interface IExecutiveSeed {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  excoPosition: ExcoPosition;
  defaultPassword: string; // Will be hashed when seeded
}

/**
 * Default password for all executives
 * IMPORTANT: Executives should change this upon first login
 */
export const DEFAULT_EXECUTIVE_PASSWORD = 'AUChapel@2026';

/**
 * Predefined list of executives
 * Update this list with actual executive details
 */
export const EXECUTIVES_SEED_DATA: IExecutiveSeed[] = [
  {
    fullName: 'Bro Kehinde Jeremiah',
    email: 'gc@auchapel.org',
    phoneNumber: '+234 800 000 0001',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.GENERAL_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Bro Emmanuel Ajayi',
    email: 'agc1@auchapel.org',
    phoneNumber: '+234 800 000 0002',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.ASSISTANT_GENERAL_COORDINATOR_1,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Bro Jerry Austin',
    email: 'agc2@auchapel.org',
    phoneNumber: '+234 800 000 0003',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.ASSISTANT_GENERAL_COORDINATOR_2,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Bro. Oluwapelumi Ajayi',
    email: 'agc3@auchapel.org',
    phoneNumber: '+234 800 000 0004',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.ASSISTANT_GENERAL_COORDINATOR_3,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Mary Ayemhoba',
    email: 'swc@auchapel.org',
    phoneNumber: '+234 800 000 0005',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.SISTER_WELFARE_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Daniella Awurumibe',
    email: 'aswc1@auchapel.org',
    phoneNumber: '+234 800 000 0006',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.ASSISTANT_SISTER_WELFARE_COORDINATOR_1,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Priscilla Adeyemi',
    email: 'aswc2@auchapel.org',
    phoneNumber: '+234 800 000 0007',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.ASSISTANT_SISTER_WELFARE_COORDINATOR_2,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Obayemi Eunice',
    email: 'aswc3@auchapel.org',
    phoneNumber: '+234 800 000 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.ASSISTANT_SISTER_WELFARE_COORDINATOR_3,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Sis. Toluwani Florence',
    email: 'fc@auchapel.org',
    phoneNumber: '+234 800 000 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.FINANCIAL_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Bro. Jeph Evans',
    email: 'mc@auchapel.org',
    phoneNumber: '+234 856 000 0004',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.MAINTENANCE_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Bro. James Abah',
    email: 'pc@auchapel.org',
    phoneNumber: '+234 856 000 0004',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.PRAYER_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Petra Adediran',
    email: 'ac@auchapel.org',
    phoneNumber: '+234 800 000 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.ACADEMIC_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Bro. Ebong Samuel',
    email: 'ec@auchapel.org',
    phoneNumber: '+234 856 000 0004',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.EVANGELISM_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
];

/**
 * Get executive by position
 */
export const getExecutiveByPosition = (position: ExcoPosition): IExecutiveSeed | undefined => {
  return EXECUTIVES_SEED_DATA.find((exec) => exec.excoPosition === position);
};

/**
 * Get all executives for dropdown selection
 */
export const getExecutivesForDropdown = () => {
  return EXECUTIVES_SEED_DATA.map((exec) => ({
    position: exec.excoPosition,
    name: exec.fullName,
    email: exec.email,
  }));
};
