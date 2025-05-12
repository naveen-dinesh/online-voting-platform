
export interface User {
  id: string;
  email: string;
  role: 'voter' | 'admin';
  isVerified: boolean; // True if email is verified (mocked as true for existing users)
  name?: string; // Optional: user's name
}

export interface BallotOption {
  id: string;
  text: string;
}

export interface BallotQuestion {
  id: string;
  text: string;
  type: 'single-choice' | 'multiple-choice';
  options: BallotOption[];
}

export interface Ballot {
  id: string;
  title: string;
  description: string;
  questions: BallotQuestion[];
  createdBy: string; // User ID of admin
  createdAt: string; // ISO date string
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: 'draft' | 'active' | 'closed'; // Status of the ballot
}

export interface VoteAnswer {
  questionId: string;
  selectedOptionIds: string[]; // Array of IDs for multiple-choice, single ID in array for single-choice
}

export interface Vote {
  id: string;
  ballotId: string;
  voterId: string; // User ID
  answers: VoteAnswer[];
  submittedAt: string; // ISO date string
}

export interface ResultData {
  questionId: string;
  questionText: string;
  options: {
    optionId: string;
    optionText: string;
    count: number;
  }[];
}

// These types align with the AI flow definitions
// and are re-exported here for potentially broader use if needed,
// though components will directly import from the AI flow module.
// export type { AnalyzeVoterTrendsInput as VoterAnalysisInput } from '@/ai/flows/analyze-voter-trends';
// export type { AnalyzeVoterTrendsOutput as VoterAnalysisOutput } from '@/ai/flows/analyze-voter-trends';
