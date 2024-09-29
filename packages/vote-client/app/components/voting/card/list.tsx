import { useVotingCards } from "~/hooks/use-voting-cards";
import { VotingCardItem } from "./item";

interface VotingCardsListProps {
  variant?: "fibonacci" | "sizes";
}

export function VotingCardList({
  variant = "fibonacci",
}: VotingCardsListProps) {
  const cards = useVotingCards(variant);

  return (
    <div className="w-full lg:w-2/3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {cards.map((card) => (
          <VotingCardItem key={card} value={card} />
        ))}
      </div>
    </div>
  );
}
