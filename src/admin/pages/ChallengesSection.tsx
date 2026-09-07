import React, { useState, useEffect } from 'react';
import { AdminChallenge } from '../types';
import { adminService } from '../services/adminSupabase';
import { ConfirmModal } from '../components/ConfirmModal';
import { Plus, Pencil, Trash2, Trophy, Search, Calendar, Tag, DollarSign, X, Check } from 'lucide-react';

interface ChallengesSectionProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const ChallengesSection: React.FC<ChallengesSectionProps> = ({ onNotify }) => {
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingChallenge, setEditingChallenge] = useState<Partial<AdminChallenge> | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminChallenge | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('mindfulness');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formIsPaid, setFormIsPaid] = useState(false);
  const [formPrice, setFormPrice] = useState(0);
  const [formDuration, setFormDuration] = useState(5);
  const [formPoints, setFormPoints] = useState(10);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const data = await adminService.getChallenges();
      setChallenges(data);
    } catch (err: any) {
      onNotify('error', 'Failed to load challenges', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('mindfulness');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormIsPaid(false);
    setFormPrice(0);
    setFormDuration(5);
    setFormPoints(10);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ch: AdminChallenge) => {
    setEditingChallenge(ch);
    setFormTitle(ch.title);
    setFormDescription(ch.description);
    setFormCategory(ch.category);
    setFormDate(ch.active_date || new Date().toISOString().split('T')[0]);
    setFormIsPaid(ch.is_paid);
    setFormPrice(ch.price);
    setFormDuration(ch.duration_minutes);
    setFormPoints(ch.reward_points);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onNotify('error', 'Title is required');
      return;
    }

    setIsSaving(true);
    try {
      await adminService.saveChallenge({
        id: editingChallenge?.id,
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        active_date: formDate,
        is_paid: formIsPaid,
        price: formIsPaid ? Number(formPrice) : 0,
        duration_minutes: Number(formDuration),
        reward_points: Number(formPoints),
      });

      onNotify('success', editingChallenge ? 'Challenge updated' : 'Challenge created', formTitle);
      setIsFormOpen(false);
      await fetchChallenges();
    } catch (err: any) {
      onNotify('error', 'Save error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminService.deleteChallenge(deleteTarget.id);
      onNotify('success', 'Challenge deleted', deleteTarget.title);
      setDeleteTarget(null);
      await fetchChallenges();
    } catch (err: any) {
      onNotify('error', 'Delete error', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = challenges.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-heading tracking-tight">Daily Wellness Challenges</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Publish, edit, and schedule daily mindful activities & habit rituals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="challenge-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search challenges..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14221C] text-[#1D2B24] dark:text-[#E2EBE6] focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            id="btn-add-challenge"
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Challenge</span>
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Title & Description</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Active Date</th>
                <th className="px-4 py-3.5">Access</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                    <span className="inline-block animate-spin mr-2">●</span> Loading challenges...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                    No challenges found. Click "Add New Challenge" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((ch) => (
                  <tr key={ch.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="px-5 py-4 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-sm text-[#1D2B24] dark:text-[#E2EBE6]">
                        {ch.title}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {ch.description || 'No description provided'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 capitalize">
                        {ch.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-stone-600 dark:text-stone-300 flex items-center gap-1.5 pt-5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{ch.active_date}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {ch.is_paid ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium">
                      {ch.is_paid ? `$${ch.price.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right space-x-1">
                      <button
                        id={`edit-challenge-${ch.id}`}
                        onClick={() => handleOpenEdit(ch)}
                        className="p-1.5 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Edit challenge"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-challenge-${ch.id}`}
                        onClick={() => setDeleteTarget(ch)}
                        className="p-1.5 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            id="challenge-form-modal"
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 shadow-2xl p-6 text-[#1D2B24] dark:text-[#E2EBE6] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-base font-bold font-serif-heading">
                {editingChallenge ? 'Edit Challenge' : 'Add New Daily Challenge'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Challenge Title *</label>
                <input
                  id="challenge-input-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Morning 4-7-8 Parasympathetic Breathwork"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description & Ritual Instructions</label>
                <textarea
                  id="challenge-input-desc"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed instructions for the user..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    id="challenge-input-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="mindfulness">Mindfulness</option>
                    <option value="movement">Movement</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="breathwork">Breathwork</option>
                    <option value="sleep">Sleep & Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Active Date *</label>
                  <input
                    id="challenge-input-date"
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Free vs Paid Toggle (Prompt: Toggle Free/Paid, price field disabled/hidden if Free) */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-xs">Access Tier</p>
                    <p className="text-[11px] text-stone-500">Require payment or provide as free community ritual</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="toggle-free"
                      onClick={() => setFormIsPaid(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        !formIsPaid 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      id="toggle-paid"
                      onClick={() => setFormIsPaid(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        formIsPaid 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      Paid
                    </button>
                  </div>
                </div>

                {/* Price field: disabled/hidden if Free */}
                {formIsPaid && (
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800 animate-in fade-in">
                    <label className="block font-semibold mb-1">Price (USD) *</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="challenge-input-price"
                        type="number"
                        step="0.5"
                        min="0.5"
                        required={formIsPaid}
                        value={formPrice}
                        onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                        placeholder="5.00"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14221C] text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Duration (minutes)</label>
                  <input
                    id="challenge-input-duration"
                    type="number"
                    min="1"
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Completion Points</label>
                  <input
                    id="challenge-input-points"
                    type="number"
                    min="1"
                    value={formPoints}
                    onChange={(e) => setFormPoints(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 font-medium rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-challenge-submit"
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-2"
                >
                  {isSaving && <span className="animate-spin text-xs">●</span>}
                  <span>{editingChallenge ? 'Update Challenge' : 'Publish Challenge'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Challenge?"
        message="Are you sure you want to delete this challenge? Users will no longer see it in their daily habits list."
        itemName={deleteTarget?.title}
        confirmLabel="Delete Challenge"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
