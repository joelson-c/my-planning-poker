import type { ComponentProps } from "react";
import { Card, CardContent } from "../../ui/card";
import { cn } from "~/lib/utils";

interface VotingCardItemProps extends ComponentProps<typeof Card> {
  value: string;
  selected?: boolean;
}

export function VotingCardItem({
  value,
  selected,
  className,
  ...props
}: VotingCardItemProps) {
  return (
    <Card
      {...props}
      className={cn(
        "cursor-pointer transition-all",
        selected && "ring-2 ring-blue-500",
        className
      )}
    >
      <CardContent className="flex items-center justify-center h-20 py-6">
        <span className="text-2xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );
}
