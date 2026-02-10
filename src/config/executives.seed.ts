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
    email: 'erioluwa.kehinde@student.aul.edu.ng',
    phoneNumber: '09128790554',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.GENERAL_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Bro Emmanuel Ajayi',
    email: 'agc1@auchapel.org',
    phoneNumber: '+234 800 000 0002',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.ASSISTANT_GENERAL_COORDINATOR_FOUNDATION_SCHOOL,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Bro Jerry Austin',
    email: 'agc2@auchapel.org',
    phoneNumber: '+234 800 000 0003',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.ASSISTANT_GENERAL_COORDINATOR_HALL_3,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Bro. Oluwapelumi Ajayi',
    email: 'agc3@auchapel.org',
    phoneNumber: '+234 800 000 0004',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.ASSISTANT_GENERAL_COORDINATOR_HALL_2,
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
    excoPosition: ExcoPosition.ASSISTANT_SISTER_WELFARE_COORDINATOR_FOUNDATION_SCHOOL,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Priscilla Adeyemi',
    email: 'aswc2@auchapel.org',
    phoneNumber: '+234 800 000 0007',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.ASSISTANT_SISTER_WELFARE_COORDINATOR_HALL_3,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Obayemi Eunice',
    email: 'aswc3@auchapel.org',
    phoneNumber: '+234 800 000 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.ASSISTANT_SISTER_WELFARE_COORDINATOR_HALL_2,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Bro. Elebute Josiah',
    email: 'cm_m@auchapel.org',
    phoneNumber: '+234 800 000 0004',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.CHOIR_MASTER,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Chukwugozie Grace',
    email: 'cm_s@auchapel.org',
    phoneNumber: '+234 800 000 0099',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.CHOIR_MISTRESS,
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
    email: 'jephunneh.evans@student.aul.edu.ng',
    phoneNumber: '08157992380',
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
    email: 'ad@auchapel.org',
    phoneNumber: '+234 800 000 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.ACADEMIC_DIRECTOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Bro. Ebong Samuel',
    email: 'ec_male@auchapel.org',
    phoneNumber: '+234 856 000 0004',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.EVANGELISM_COORDINATOR_MALE,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Kingsley Mercy',
    email: 'ec_female@auchapel.org',
    phoneNumber: '+234 800 000 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.EVANGELISM_COORDINATOR_FEMALE,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Sis. Olugbodi Precious',
    email: 'sc@auchapel.org',
    phoneNumber: '+234 800 000 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.SECRETARIAT_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Sis. Eze Eunice',
    email: 'lc@auchapel.org',
    phoneNumber: '+234 800 000 2308',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.LIBRARY_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Bro. Jehoshaphat Ibenye',
    email: 'hu_m@auchapel.org',
    phoneNumber: '+234 856 460 0004',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.HEAD_USHER_MALE,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Ojo Success',
    email: 'hu_f@auchapel.org',
    phoneNumber: '+234 800 000 0308',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.HEAD_USHER_FEMALE,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Sis. Adeyeri Inioluwa',
    email: 'cl@auchapel.org',
    phoneNumber: '+234 893 000 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.COLPOTEUR_LEADER,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Sis. Ajayi Simisola',
    email: 'fr_p@auchapel.org',
    phoneNumber: '+234 893 000 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.FLOOR_REP_PATIENCE,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Sis. Elizabeth Eze',
    email: 'hp_p@auchapel.org',
    phoneNumber: '+234 893 078 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.HALL_REP_PURITY,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  
  },
  {
    fullName: 'Bro. Enoch Oladele',
    email: 'hr_p@auchapel.org',
    phoneNumber: '+234 856 460 0004',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.HALL_REP_PEACE,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sis. Patrick Goodness',
    email: 'gpt@auchapel.org',
    phoneNumber: '+234 893 078 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.GPT_LEADER,
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
