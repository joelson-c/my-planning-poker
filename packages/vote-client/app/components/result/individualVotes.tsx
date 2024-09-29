import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export function ResultIndividualVotes() {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Individual Votes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2].map((vote, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>{`T`}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{`Test ${vote}`}</p>
                <p className="text-sm text-muted-foreground">Voted: {13}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
