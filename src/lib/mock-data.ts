
import type { User, Ballot, Vote, BallotQuestion, ResultData } from '@/types';

// --- Initial Hardcoded Data ---
const initialMockUsers: User[] = [
  { id: 'user-voter-01', email: 'voter@example.com', role: 'voter', isVerified: true, name: 'Jane Voter', password: 'Voter123' },
  { id: 'user-admin-01', email: 'admin@example.com', role: 'admin', isVerified: true, name: 'John Admin', password: 'Password123' },
  { id: 'user-admin-02', email: 'admin@admin.com', role: 'admin', isVerified: true, name: 'Super Admin', password: 'Admin123' },
  { id: 'user-voter-02', email: 'another.voter@example.com', role: 'voter', isVerified: true, name: 'Alex Smith', password: 'Password123' },
  { id: 'user-unverified-01', email: 'unverified.user@example.com', role: 'voter', isVerified: false, name: 'Unverified Test', password: 'Password123' },
  { id: 'user-voter-03', email: 'user@user.com', role: 'voter', isVerified: true, name: 'Test User', password: 'User123' },
];

const initialSampleQuestions: BallotQuestion[] = [
  {
    id: 'q1-annual-election',
    text: 'Choose your preferred candidate for Team Lead:',
    type: 'single-choice',
    options: [
      { id: 'q1o1', text: 'Alice Wonderland' },
      { id: 'q1o2', text: 'Bob The Builder' },
      { id: 'q1o3', text: 'Charlie Brown' },
    ],
  },
  {
    id: 'q2-policy-initiatives',
    text: 'Which policy initiatives do you support? (Select all that apply)',
    type: 'multiple-choice',
    options: [
      { id: 'q2o1', text: 'Flexible Work Hours' },
      { id: 'q2o2', text: 'Increased Training Budget' },
      { id: 'q2o3', text: 'New Coffee Machine Fund' },
    ],
  },
];

const initialMockBallots: Ballot[] = [
  {
    id: 'ballot-active-01',
    title: 'Annual Company Leadership Election',
    description: 'Elect the new team lead and vote on important company policy initiatives for the upcoming year.',
    questions: initialSampleQuestions, // Use the defined sample questions
    createdBy: 'user-admin-01',
    createdAt: new Date('2024-07-01T10:00:00Z').toISOString(),
    startDate: new Date('2024-07-15T00:00:00Z').toISOString(),
    endDate: new Date('2024-08-15T23:59:59Z').toISOString(),
    status: 'active',
  },
  {
    id: 'ballot-active-02',
    title: 'Project Phoenix Name Referendum',
    description: 'Help us choose the official name for our exciting new internal project, codenamed "Phoenix".',
    questions: [
      {
        id: 'q1-project-name',
        text: 'What should be the official name for Project Phoenix?',
        type: 'single-choice',
        options: [
          { id: 'q1pno1', text: 'NovaSuite' },
          { id: 'q1pno2', text: 'InnovateHub' },
          { id: 'q1pno3', text: 'SynergyCore' },
          { id: 'q1pno4', text: 'MomentumOS' },
        ],
      },
    ],
    createdBy: 'user-admin-01',
    createdAt: new Date('2024-07-10T14:00:00Z').toISOString(),
    startDate: new Date('2024-07-20T00:00:00Z').toISOString(),
    endDate: new Date('2024-08-20T23:59:59Z').toISOString(),
    status: 'active',
  },
  {
    id: 'ballot-closed-01',
    title: 'Q1 2024 Feedback Survey (Closed)',
    description: 'Results from the quarterly feedback survey regarding workplace satisfaction and tooling.',
    questions: [
      {
        id: 'q1-satisfaction',
        text: 'Overall, how satisfied are you with your current role?',
        type: 'single-choice',
        options: [
          { id: 'q1so1', text: 'Very Satisfied' },
          { id: 'q1so2', text: 'Satisfied' },
          { id: 'q1so3', text: 'Neutral' },
          { id: 'q1so4', text: 'Dissatisfied' },
          { id: 'q1so5', text: 'Very Dissatisfied' },
        ],
      },
    ],
    createdBy: 'user-admin-01',
    createdAt: new Date('2024-01-05T09:00:00Z').toISOString(),
    startDate: new Date('2024-01-10T00:00:00Z').toISOString(),
    endDate: new Date('2024-01-20T23:59:59Z').toISOString(),
    status: 'closed',
  },
];

const initialMockVotes: Vote[] = [
  // Votes for ballot-active-01
  {
    id: 'vote-001', ballotId: 'ballot-active-01', voterId: 'user-voter-01',
    answers: [
      { questionId: 'q1-annual-election', selectedOptionIds: ['q1o1'] },
      { questionId: 'q2-policy-initiatives', selectedOptionIds: ['q2o1', 'q2o3'] },
    ],
    submittedAt: new Date('2024-07-16T10:00:00Z').toISOString(),
  },
  {
    id: 'vote-002', ballotId: 'ballot-active-01', voterId: 'user-voter-02',
    answers: [
      { questionId: 'q1-annual-election', selectedOptionIds: ['q1o2'] },
      { questionId: 'q2-policy-initiatives', selectedOptionIds: ['q2o2'] },
    ],
    submittedAt: new Date('2024-07-17T11:00:00Z').toISOString(),
  },
  {
    id: 'vote-003', ballotId: 'ballot-active-01', voterId: 'mock-voter-3', // Generic mock voter ID
    answers: [
      { questionId: 'q1-annual-election', selectedOptionIds: ['q1o1'] },
      { questionId: 'q2-policy-initiatives', selectedOptionIds: ['q2o1', 'q2o2'] },
    ],
    submittedAt: new Date('2024-07-18T09:30:00Z').toISOString(),
  },
  {
    id: 'vote-004', ballotId: 'ballot-active-01', voterId: 'mock-voter-4', // Generic mock voter ID
    answers: [
      { questionId: 'q1-annual-election', selectedOptionIds: ['q1o3'] },
      { questionId: 'q2-policy-initiatives', selectedOptionIds: ['q2o3'] },
    ],
    submittedAt: new Date('2024-07-19T14:15:00Z').toISOString(),
  },
  // Votes for ballot-closed-01
  {
    id: 'vote-005', ballotId: 'ballot-closed-01', voterId: 'user-voter-01',
    answers: [{ questionId: 'q1-satisfaction', selectedOptionIds: ['q1so1'] }],
    submittedAt: new Date('2024-01-11T10:00:00Z').toISOString(),
  },
  {
    id: 'vote-006', ballotId: 'ballot-closed-01', voterId: 'user-voter-02',
    answers: [{ questionId: 'q1-satisfaction', selectedOptionIds: ['q1so2'] }],
    submittedAt: new Date('2024-01-12T11:00:00Z').toISOString(),
  },
  {
    id: 'vote-007', ballotId: 'ballot-closed-01', voterId: 'mock-voter-3',
    answers: [{ questionId: 'q1-satisfaction', selectedOptionIds: ['q1so1'] }],
    submittedAt: new Date('2024-01-13T11:00:00Z').toISOString(),
  },
  {
    id: 'vote-008', ballotId: 'ballot-closed-01', voterId: 'mock-voter-4',
    answers: [{ questionId: 'q1-satisfaction', selectedOptionIds: ['q1so3'] }],
    submittedAt: new Date('2024-01-14T11:00:00Z').toISOString(),
  },
];
// --- End Initial Hardcoded Data ---

// --- localStorage Helper ---
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue) as T;
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      localStorage.removeItem(key); // Clear corrupted data
    }
  }
  return defaultValue;
}

function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }
}
// --- End localStorage Helper ---

// --- Exported Data (Potentially from localStorage) ---
export let mockUsers: User[] = loadFromLocalStorage<User[]>('votewiseMockUsers', initialMockUsers);

let loadedMockBallots = loadFromLocalStorage<Ballot[]>('votewiseMockBallots', initialMockBallots);
const todayMs = new Date().getTime();

loadedMockBallots.forEach(ballot => {
  if (ballot.status === 'active') {
    const endDateMs = new Date(ballot.endDate).getTime();
    const startDateMs = new Date(ballot.startDate).getTime();
    // If end date is past, or if start date is significantly in the future (more than a day from now),
    // then adjust dates to make it currently active for demo purposes.
    if (endDateMs < todayMs || startDateMs > todayMs + (24 * 60 * 60 * 1000)) {
        const newStartDate = new Date();
        newStartDate.setDate(newStartDate.getDate() - 2); // Set start to 2 days ago
        newStartDate.setHours(0,0,0,0); // Set time to beginning of the day

        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 7); // Set end to 7 days from now
        newEndDate.setHours(23,59,59,999); // Set time to end of the day

        ballot.startDate = newStartDate.toISOString();
        ballot.endDate = newEndDate.toISOString();
    }
  }
});
export let mockBallots: Ballot[] = loadedMockBallots;

export let mockVotes: Vote[] = loadFromLocalStorage<Vote[]>('votewiseMockVotes', initialMockVotes);
// --- End Exported Data ---

// --- Functions to update and save data ---
export function addUser(newUser: User): User | null {
  const existingUser = mockUsers.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());
  if (existingUser) {
    return null; // Email already exists
  }
  mockUsers.push(newUser);
  saveToLocalStorage('votewiseMockUsers', mockUsers);
  return newUser;
}

export function addBallot(newBallot: Ballot): void {
  // Ensure new active ballots have valid future end dates relative to their start date
  if (newBallot.status === 'active') {
    const startDate = new Date(newBallot.startDate);
    let endDate = new Date(newBallot.endDate);
    if (endDate <= startDate) {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7); // Default to 7 days duration if end date is invalid
        newBallot.endDate = endDate.toISOString();
    }
  }
  mockBallots.unshift(newBallot); // Add to the beginning of the array to show newest first
  saveToLocalStorage('votewiseMockBallots', mockBallots);
}

export function addVote(newVote: Vote): void {
  const existingVoteIndex = mockVotes.findIndex(
    v => v.ballotId === newVote.ballotId && v.voterId === newVote.voterId
  );

  // Check if a vote from this user for this ballot already exists
  if (existingVoteIndex !== -1) {
    // If a vote already exists (regardless of user role), throw an error.
    throw new Error("ALREADY_VOTED");
  } else {
    // If no existing vote, add the new vote.
    mockVotes.push(newVote);
  }
  saveToLocalStorage('votewiseMockVotes', mockVotes);
}
// --- End Functions to update and save data ---

export const getMockResults = (ballotId: string): ResultData[] => {
  const ballot = mockBallots.find(b => b.id === ballotId);
  if (!ballot) return [];

  const relevantVotes = mockVotes.filter(v => v.ballotId === ballotId);

  return ballot.questions.map(question => {
    const optionsData = question.options.map(option => {
      const count = relevantVotes.reduce((sum, vote) => {
        const answer = vote.answers.find(a => a.questionId === question.id);
        return answer && answer.selectedOptionIds.includes(option.id) ? sum + 1 : sum;
      }, 0);
      return { optionId: option.id, optionText: option.text, count };
    });
    return {
      questionId: question.id,
      questionText: question.text,
      options: optionsData,
    };
  });
};

export const mockAnonymizedVoterData = JSON.stringify(
  {
    total_verified_voters: 485,
    ballot_participation_rate: 0.75,
    age_group_analysis: {
      "18-29": { participation: 120, preference_q1_candidate_A: 0.4, preference_q1_candidate_B: 0.35, preference_q1_candidate_C: 0.25 },
      "30-45": { participation: 180, preference_q1_candidate_A: 0.3, preference_q1_candidate_B: 0.45, preference_q1_candidate_C: 0.25 },
      "46-60": { participation: 110, preference_q1_candidate_A: 0.35, preference_q1_candidate_B: 0.30, preference_q1_candidate_C: 0.35 },
      "60+": { participation: 75, preference_q1_candidate_A: 0.25, preference_q1_candidate_B: 0.40, preference_q1_candidate_C: 0.35 },
    },
    department_analysis: {
      "Engineering": { participation: 150, initiative_support_flex_work: 0.8, initiative_support_training_budget: 0.6 },
      "Marketing": { participation: 85, initiative_support_flex_work: 0.65, initiative_support_training_budget: 0.75 },
      "Sales": { participation: 100, initiative_support_flex_work: 0.5, initiative_support_training_budget: 0.55 },
      "HR": { participation: 50, initiative_support_flex_work: 0.9, initiative_support_training_budget: 0.8 },
      "Support": { participation: 100, initiative_support_flex_work: 0.7, initiative_support_training_budget: 0.6 },
    },
    general_feedback_summary: "Overall positive engagement, with notable interest in flexible work arrangements across departments. Candidate preferences show a competitive field, with varying support across age groups."
  }, null, 2
);

// Initial save to localStorage if empty, or to ensure data integrity after code changes
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('votewiseMockUsers')) {
    saveToLocalStorage('votewiseMockUsers', initialMockUsers);
  } else {
    // If users are already in localStorage, we use them.
    // This ensures that newly registered users persist across sessions.
    mockUsers = loadFromLocalStorage<User[]>('votewiseMockUsers', initialMockUsers);
  }

  const storedBallots = localStorage.getItem('votewiseMockBallots');
  if (!storedBallots) {
    saveToLocalStorage('votewiseMockBallots', mockBallots);
  } else {
    // The `mockBallots` variable is already updated with loaded and adjusted data.
    // Re-save it to ensure the adjusted dates are persisted if they changed.
    saveToLocalStorage('votewiseMockBallots', mockBallots);
  }
  
  if (!localStorage.getItem('votewiseMockVotes')) {
    saveToLocalStorage('votewiseMockVotes', initialMockVotes); 
  }
}

