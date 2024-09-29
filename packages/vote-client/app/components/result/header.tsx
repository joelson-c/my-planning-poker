import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function ResultHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Voting Results</h1>
      {true && (
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Start New Vote
        </Button>
      )}
    </div>
  );
}
