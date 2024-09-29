import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  json,
  useActionData,
  useParams,
} from "@remix-run/react";
import { RoomLogin } from "~/components/room/login";

type RouteParams = {
  roomId: string;
};

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  if (!params.roomId) {
    throw new Response(null, {
      status: 403,
    });
  }

  // TODO: validate roomId

  return null;
};

export default function JoinRoom() {
  const data = useActionData<typeof clientAction>();
  const { roomId } = useParams<RouteParams>();

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <RoomLogin roomId={roomId} />
    </div>
  );
}
export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  // TODO: Join room
  console.log(await request.formData());
  return json({ errors: { nickname: "Nickname is required" } });
};
