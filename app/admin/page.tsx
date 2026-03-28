// app/admin/page.tsx
import { getCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-2xl">Admin Panel</h1>
      <p className="text-gray-600">Only admins can see this.</p>

      {user && (
        <div className="bg-red-100 mt-4 p-4 rounded">
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      )}
    </div>
  );
}
