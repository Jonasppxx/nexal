'use client';

import { useState, useEffect } from 'react';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  currency: string | null;
  duration: string;
  durationInMonths: number | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    currency: 'eur',
    duration: 'once',
    durationInMonths: '',
    maxRedemptions: '',
    expiresAt: '',
    active: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons';
      const method = editingCoupon ? 'PATCH' : 'POST';

      const payload: any = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        duration: formData.duration,
        active: formData.active,
      };

      if (formData.discountType === 'fixed_amount') {
        payload.currency = formData.currency;
      }

      if (formData.duration === 'repeating' && formData.durationInMonths) {
        payload.durationInMonths = parseInt(formData.durationInMonths);
      }

      if (formData.maxRedemptions) {
        payload.maxRedemptions = parseInt(formData.maxRedemptions);
      }

      if (formData.expiresAt) {
        payload.expiresAt = formData.expiresAt;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert(editingCoupon ? 'Coupon updated!' : 'Coupon created!');
        fetchCoupons();
        resetForm();
      } else {
        alert(`Error: ${data.error || 'Failed to save coupon'}`);
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Failed to save coupon');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      currency: coupon.currency || 'eur',
      duration: coupon.duration,
      durationInMonths: coupon.durationInMonths?.toString() || '',
      maxRedemptions: coupon.maxRedemptions?.toString() || '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '',
      active: coupon.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert('Coupon deleted successfully!');
        fetchCoupons();
      } else {
        alert(`Error: ${data.error || 'Failed to delete coupon'}`);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      currency: 'eur',
      duration: 'once',
      durationInMonths: '',
      maxRedemptions: '',
      expiresAt: '',
      active: true,
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-300">Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Coupon Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-4 text-white">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-200">Coupon Code *</label>
              <input
                type="text"
                required
                disabled={!!editingCoupon}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white uppercase disabled:opacity-50"
                placeholder="SUMMER2025"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-200">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
                placeholder="Summer Sale"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-200">Discount Type *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
                disabled={!!editingCoupon}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-200">
                Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(Amount)'}
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                max={formData.discountType === 'percentage' ? '100' : undefined}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
                disabled={!!editingCoupon}
              />
            </div>

            {formData.discountType === 'fixed_amount' && (
              <div>
                <label className="block mb-2 font-medium text-gray-200">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
                  disabled={!!editingCoupon}
                >
                  <option value="eur">EUR (€)</option>
                  <option value="usd">USD ($)</option>
                  <option value="gbp">GBP (£)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium text-gray-200">Duration *</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
                disabled={!!editingCoupon}
              >
                <option value="once">Once</option>
                <option value="repeating">Repeating</option>
                <option value="forever">Forever</option>
              </select>
            </div>

            {formData.duration === 'repeating' && (
              <div>
                <label className="block mb-2 font-medium text-gray-200">Duration (Months)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.durationInMonths}
                  onChange={(e) => setFormData({ ...formData, durationInMonths: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
                  disabled={!!editingCoupon}
                />
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium text-gray-200">Max Redemptions</label>
              <input
                type="number"
                min="1"
                value={formData.maxRedemptions}
                onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
                placeholder="Unlimited"
                disabled={!!editingCoupon}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-200">Expires At</label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
                disabled={!!editingCoupon}
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-2"
                />
                <span className="font-medium text-gray-200">Active</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-200">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
                rows={2}
                placeholder="Special discount for summer season"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editingCoupon ? 'Update' : 'Create'} Coupon
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800 shadow rounded">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-200">Code</th>
              <th className="px-4 py-2 text-left text-gray-200">Name</th>
              <th className="px-4 py-2 text-left text-gray-200">Discount</th>
              <th className="px-4 py-2 text-left text-gray-200">Duration</th>
              <th className="px-4 py-2 text-center text-gray-200">Usage</th>
              <th className="px-4 py-2 text-center text-gray-200">Status</th>
              <th className="px-4 py-2 text-center text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No coupons found. Create your first coupon!
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-2 font-medium text-white font-mono">{coupon.code}</td>
                  <td className="px-4 py-2 text-white">{coupon.name}</td>
                  <td className="px-4 py-2 text-white">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `${coupon.discountValue.toFixed(2)} ${coupon.currency?.toUpperCase()}`}
                  </td>
                  <td className="px-4 py-2 text-gray-300">
                    {coupon.duration === 'repeating'
                      ? `${coupon.durationInMonths} months`
                      : coupon.duration}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-300">
                    {coupon.timesRedeemed}
                    {coupon.maxRedemptions && ` / ${coupon.maxRedemptions}`}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        coupon.active
                          ? 'bg-green-900 text-green-200'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
