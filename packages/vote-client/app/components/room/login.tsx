import { Label } from "@radix-ui/react-label";
import { Form } from "@remix-run/react";
import { Github } from "~/components/icons/github";
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

interface RoomLoginProps {
  roomId?: string;
}

export function RoomLogin({ roomId }: RoomLoginProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Planning Poker
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
        <Button variant="outline" className="w-full" asChild>
          <a
            href="https://github.com/joelson-c/my-planning-poker"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="mr-2 h-4 w-4" />
            View on GitHub
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
