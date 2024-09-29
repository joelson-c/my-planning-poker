import { Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { useCallback } from "react";
import { toast } from "~/hooks/use-toast";
import { RepositoryLink } from "../repository/link";

interface VotingHeaderProps {
  roomId: string;
}

export function VotingHeader({ roomId }: VotingHeaderProps) {
  const handleShareRoom = useCallback(async () => {
    const roomLink = `${window.location.origin}/join/${roomId}`;
    try {
      await navigator.clipboard.writeText(roomLink);
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please try again or copy it manually.",
        variant: "destructive",
      });
    }
    toast({
      title: "Room link copied!",
      description: "Share this link with your team members.",
    });
  }, [roomId]);

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Planning Poker</h1>
      <div className="flex space-x-2">
        <Button
          onClick={handleShareRoom}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Room
        </Button>
        <RepositoryLink />
      </div>
    </div>
  );
}
