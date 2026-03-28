import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  // async because getCurrentUser is async
  const user = await getCurrentUser();

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-2xl">Dashboard</h1>
      <p className="text-gray-600">Welcome back!</p>

      {user && (
        <div className="bg-gray-100 mt-4 p-4 rounded">
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>ID: {user.userId}</p>
        </div>
      )}
    </div>
  );
}
