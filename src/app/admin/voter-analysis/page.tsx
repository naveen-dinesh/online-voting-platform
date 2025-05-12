
import { VoterAnalysisTool } from "@/components/admin/voter-analysis-tool";
import { BrainCircuit } from "lucide-react";

export const metadata = {
  title: 'AI Voter Trend Analysis | VoteWise Admin',
  description: 'Utilize AI to analyze anonymized voter data, identify key trends, potential biases, and receive actionable recommendations for improving electoral fairness and inclusivity.',
};

export default function VoterAnalysisPage() {
  return (
    <div className="space-y-8">
        <div className="flex items-center space-x-3 mb-6 p-4 bg-primary/5 rounded-lg">
            <BrainCircuit className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold text-foreground">AI Voter Trend Analysis</h1>
                <p className="text-muted-foreground">Leverage artificial intelligence to uncover insights from voter data.</p>
            </div>
        </div>
      <VoterAnalysisTool />
    </div>
  );
}
