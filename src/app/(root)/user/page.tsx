import { auth, signIn} from "@/auth";
export default async function UserPage() {
    const session = await auth();

    if (!session)
        await signIn();

    return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4">User Profile</h1>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
                <p className="text-gray-600">{session?.user?.email}</p>
                <p className="text-gray-500">{session?.user?.roleId}</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">User ID:</h3>
              <p>{session?.user?.id}</p>
            </div>
          </div>
        </div>
      );
}