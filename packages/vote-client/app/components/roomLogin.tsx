import { Label } from "@radix-ui/react-label";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { RepositoryLink } from "./repository/link";

interface RoomLoginProps {
  roomId?: string;
}

export function RoomLogin({ roomId }: RoomLoginProps) {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {roomId ? `Join Planning Poker Room` : `Planning Poker`}
          </CardTitle>
          <CardDescription className="text-center">
            Enter a nickname to join the session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input id="nickname" placeholder="Enter your nickname" />
                {true && <p className="text-sm text-red-500">{"ABC"}</p>}
              </div>
              {roomId && (
                <div className="space-y-2">
                  <Label htmlFor="roomid">Room ID</Label>
                  <Input value={roomId} id="roomId" readOnly />
                </div>
              )}
              <Button type="submit" className="w-full">
                Join Session
              </Button>
            </div>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            This is an open-source project. Contribute or star us on GitHub!
          </div>
          <RepositoryLink />
        </CardFooter>
      </Card>
    </div>
  );
}
