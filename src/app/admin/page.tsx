'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    loading: true,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [usersRes, postsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/posts'),
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const posts = postsRes.ok ? await postsRes.json() : [];

      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalPosts: Array.isArray(posts) ? posts.length : 0,
        loading: false,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your application</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.loading ? '...' : stats.totalUsers}
          </p>
          <p className="text-sm text-gray-500 mt-2">Registered accounts</p>
        </div>

        {/* Total Posts */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total Posts</h3>
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.loading ? '...' : stats.totalPosts}
          </p>
          <p className="text-sm text-gray-500 mt-2">Published content</p>
        </div>

        {/* Active Sessions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">System Status</h3>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-green-400">Online</p>
          <p className="text-sm text-gray-500 mt-2">All systems operational</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors"
          >
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium text-white">Manage Users</p>
              <p className="text-sm text-gray-400">View and edit users</p>
            </div>
          </a>
          
          <a
            href="/admin/settings"
            className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors"
          >
            <span className="text-2xl">⚙️</span>
            <div>
              <p className="font-medium text-white">Settings</p>
              <p className="text-sm text-gray-400">Configure application</p>
            </div>
          </a>

          <button
            onClick={fetchStats}
            className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors text-left"
          >
            <span className="text-2xl">🔄</span>
            <div>
              <p className="font-medium text-white">Refresh Stats</p>
              <p className="text-sm text-gray-400">Update dashboard data</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
