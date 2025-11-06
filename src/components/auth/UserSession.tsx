"use client";

import { useSession, signOut } from "@/src/lib/auth-client";

export default function UserSession() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-900 mb-3">
        Authenticated User
      </h3>
      <div className="space-y-2 text-sm">
        <p className="text-gray-700">
          <span className="font-medium">Name:</span> {session.user.name || "N/A"}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Email:</span> {session.user.email}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">User ID:</span> {session.user.id}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Email Verified:</span>{" "}
          {session.user.emailVerified ? "Yes" : "No"}
        </p>
      </div>
      <button
        onClick={async () => {
          await signOut();
          window.location.reload();
        }}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
