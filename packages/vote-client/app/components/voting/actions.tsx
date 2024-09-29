import { Button } from "../ui/button";

export function VotingActions() {
  return (
    <div className="flex justify-center space-x-4 mb-6">
      <Button>Reveal Cards</Button>
      <Button variant="outline">Reset</Button>
    </div>
  );
}
