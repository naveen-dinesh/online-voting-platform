
import { BallotCreationForm } from "@/components/admin/ballot-creation-form";
import { FileText } from "lucide-react";

export default function CreateBallotPage() {
  return (
    <div className="space-y-8">
        <div className="flex items-center space-x-3 mb-6 p-4 bg-primary/5 rounded-lg">
            <FileText className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold text-foreground">Create New Ballot</h1>
                <p className="text-muted-foreground">Design and configure a new ballot for your voters.</p>
            </div>
        </div>
        <BallotCreationForm />
    </div>
  );
}
