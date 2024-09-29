import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  json,
  redirect,
  useActionData,
  useParams,
} from "@remix-run/react";
import { RoomLogin } from "~/components/roomLogin";

type RouteParams = {
  roomId: string;
};

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  if (!params.roomId) {
    throw new Response(null, {
      status: 403,
    });
  }

  return null;
};

export default function Join() {
  const { roomId } = useParams<RouteParams>();

  return (
    <main>
      <RoomLogin roomId={roomId} />
    </main>
  );
}

export const clientAction = async ({
  request,
  params,
}: ClientActionFunctionArgs) => {
  // TODO: Save nickname to atom
  return redirect(`/room/${params.roomId!}`);
};
