import { signOutUser } from "@/server/actions/user";
import { auth } from "@/server/helpers/auth";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div>
      <p>{JSON.stringify(session)}</p>
      <form action={signOutUser}>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}
