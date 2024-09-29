import type { MetaFunction } from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  json,
  useActionData,
} from "@remix-run/react";
import { RoomLogin } from "~/components/room/login";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const data = useActionData<typeof clientAction>();

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <RoomLogin roomId="abc" />
    </div>
  );
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  // TODO: Create and join room
  console.log(await request.formData());
  return json({ errors: { nickname: "Nickname is required" } });
};
