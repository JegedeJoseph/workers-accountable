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
    fullName: 'Chapel President',
    email: 'president@auchapel.org',
    phoneNumber: '+234 800 000 0001',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.PRESIDENT,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Chapel Vice President',
    email: 'vicepresident@auchapel.org',
    phoneNumber: '+234 800 000 0002',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.VICE_PRESIDENT,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'General Secretary',
    email: 'gensec@auchapel.org',
    phoneNumber: '+234 800 000 0003',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.GENERAL_SECRETARY,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Assistant General Secretary',
    email: 'asstgensec@auchapel.org',
    phoneNumber: '+234 800 000 0004',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.ASSISTANT_GENERAL_SECRETARY,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Financial Secretary',
    email: 'finsec@auchapel.org',
    phoneNumber: '+234 800 000 0005',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.FINANCIAL_SECRETARY,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Treasurer',
    email: 'treasurer@auchapel.org',
    phoneNumber: '+234 800 000 0006',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.TREASURER,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Welfare Director',
    email: 'welfare@auchapel.org',
    phoneNumber: '+234 800 000 0007',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.WELFARE_DIRECTOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Prayer Director',
    email: 'prayer@auchapel.org',
    phoneNumber: '+234 800 000 0008',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.PRAYER_DIRECTOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Evangelism Director',
    email: 'evangelism@auchapel.org',
    phoneNumber: '+234 800 000 0009',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.EVANGELISM_DIRECTOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Choir Director',
    email: 'choir@auchapel.org',
    phoneNumber: '+234 800 000 0010',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.CHOIR_DIRECTOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Technical Director',
    email: 'technical@auchapel.org',
    phoneNumber: '+234 800 000 0011',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.TECHNICAL_DIRECTOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Media Director',
    email: 'media@auchapel.org',
    phoneNumber: '+234 800 000 0012',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.MEDIA_DIRECTOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Protocol Director',
    email: 'protocol@auchapel.org',
    phoneNumber: '+234 800 000 0013',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.PROTOCOL_DIRECTOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Ushering Coordinator',
    email: 'ushering@auchapel.org',
    phoneNumber: '+234 800 000 0014',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.USHERING_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Sanctuary Coordinator',
    email: 'sanctuary@auchapel.org',
    phoneNumber: '+234 800 000 0015',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.SANCTUARY_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Children Coordinator',
    email: 'children@auchapel.org',
    phoneNumber: '+234 800 000 0016',
    gender: Gender.FEMALE,
    excoPosition: ExcoPosition.CHILDREN_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Drama Coordinator',
    email: 'drama@auchapel.org',
    phoneNumber: '+234 800 000 0017',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.DRAMA_COORDINATOR,
    defaultPassword: DEFAULT_EXECUTIVE_PASSWORD,
  },
  {
    fullName: 'Instrumentals Coordinator',
    email: 'instrumentals@auchapel.org',
    phoneNumber: '+234 800 000 0018',
    gender: Gender.MALE,
    excoPosition: ExcoPosition.INSTRUMENTALS_COORDINATOR,
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
