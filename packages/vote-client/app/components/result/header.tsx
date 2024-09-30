import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useCallback } from "react";
import { useNavigate } from "@remix-run/react";

interface ResultHeaderProps {
  roomId: string;
}

export function ResultHeader({ roomId }: ResultHeaderProps) {
  const navigate = useNavigate();

  const onNewVotingClick = useCallback(() => {
    navigate(`/room/${roomId}`);
  }, [navigate, roomId]);

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Voting Results</h1>
      {true && (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onNewVotingClick}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Start New Vote
        </Button>
      )}
    </div>
  );
}
