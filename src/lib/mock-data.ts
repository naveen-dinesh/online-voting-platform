
import type { User, Ballot, Vote, BallotQuestion, ResultData } from '@/types';

export const mockUsers: User[] = [
  { id: 'user-voter-01', email: 'voter@example.com', role: 'voter', isVerified: true, name: 'Jane Voter', password: 'Voter123' },
  { id: 'user-admin-01', email: 'admin@example.com', role: 'admin', isVerified: true, name: 'John Admin', password: 'Password123' }, // Existing admin with a generic password
  { id: 'user-admin-02', email: 'admin@admin.com', role: 'admin', isVerified: true, name: 'Super Admin', password: 'Admin123' }, // New admin as per request
  { id: 'user-voter-02', email: 'another.voter@example.com', role: 'voter', isVerified: true, name: 'Alex Smith', password: 'Password123' },
  { id: 'user-unverified-01', email: 'unverified.user@example.com', role: 'voter', isVerified: false, name: 'Unverified Test', password: 'Password123' },
  { id: 'user-voter-03', email: 'user@user.com', role: 'voter', isVerified: true, name: 'Test User', password: 'User123' },
];

const sampleQuestions: BallotQuestion[] = [
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

export const mockBallots: Ballot[] = [
  {
    id: 'ballot-active-01',
    title: 'Annual Company Leadership Election',
    description: 'Elect the new team lead and vote on important company policy initiatives for the upcoming year.',
    questions: sampleQuestions,
    createdBy: 'user-admin-01',
    createdAt: new Date('2024-07-01T10:00:00Z').toISOString(),
    startDate: new Date('2024-07-15T00:00:00Z').toISOString(),
    endDate: new Date('2024-08-15T23:59:59Z').toISOString(), // Make sure this is in the future from "now" for testing
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
    endDate: new Date('2024-08-20T23:59:59Z').toISOString(), // Also in the future
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

// Initialize endDate for active ballots to be in the future for demo purposes
const today = new Date();
mockBallots.forEach(ballot => {
  if (ballot.status === 'active') {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 5); // Started 5 days ago
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 10); // Ends 10 days from now
    ballot.startDate = startDate.toISOString();
    ballot.endDate = endDate.toISOString();
  }
});


export const mockVotes: Vote[] = [
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
   // More votes for ballot-active-01 to make results interesting
  {
    id: 'vote-003', ballotId: 'ballot-active-01', voterId: 'mock-voter-3',
    answers: [
      { questionId: 'q1-annual-election', selectedOptionIds: ['q1o1'] },
      { questionId: 'q2-policy-initiatives', selectedOptionIds: ['q2o1', 'q2o2'] },
    ],
    submittedAt: new Date('2024-07-18T09:30:00Z').toISOString(),
  },
  {
    id: 'vote-004', ballotId: 'ballot-active-01', voterId: 'mock-voter-4',
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

// Function to generate mock results for a ballot
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

// Mock anonymized data for AI analysis
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

