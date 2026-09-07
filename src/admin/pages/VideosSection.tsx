import React, { useState, useEffect } from 'react';
import { AdminVideo } from '../types';
import { adminService } from '../services/adminSupabase';
import { ConfirmModal } from '../components/ConfirmModal';
import { Plus, Pencil, Trash2, Search, Upload, Video as VideoIcon, ExternalLink, X } from 'lucide-react';

interface VideosSectionProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const VideosSection: React.FC<VideosSectionProps> = ({ onNotify }) => {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingVideo, setEditingVideo] = useState<Partial<AdminVideo> | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState<boolean>(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<AdminVideo | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formCategory, setFormCategory] = useState('movement');
  const [formDuration, setFormDuration] = useState('10 min');
  const [formInstructor, setFormInstructor] = useState('Dr. Selamawit Tena');

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await adminService.getVideos();
      setVideos(data);
    } catch (err: any) {
      onNotify('error', 'Failed to load videos', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleOpenCreate = () => {
    setEditingVideo(null);
    setFormTitle('');
    setFormYoutubeUrl('');
    setFormThumbnailUrl('');
    setFormCategory('movement');
    setFormDuration('10 min');
    setFormInstructor('Dr. Selamawit Tena');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v: AdminVideo) => {
    setEditingVideo(v);
    setFormTitle(v.title);
    setFormYoutubeUrl(v.youtube_url);
    setFormThumbnailUrl(v.thumbnail_url);
    setFormCategory(v.category);
    setFormDuration(v.duration);
    setFormInstructor(v.instructor);
    setIsFormOpen(true);
  };

  // Auto-detect YouTube thumbnail when YouTube URL changes
  const handleYoutubeUrlChange = (url: string) => {
    setFormYoutubeUrl(url);
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1] && !formThumbnailUrl) {
      setFormThumbnailUrl(`https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    try {
      const url = await adminService.uploadMedia(file, 'thumbnails');
      setFormThumbnailUrl(url);
      onNotify('success', 'Custom thumbnail uploaded', file.name);
    } catch (err: any) {
      onNotify('error', 'Upload failed', err.message);
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formYoutubeUrl.trim()) {
      onNotify('error', 'Title and YouTube URL are required');
      return;
    }

    setIsSaving(true);
    try {
      await adminService.saveVideo({
        id: editingVideo?.id,
        title: formTitle.trim(),
        youtube_url: formYoutubeUrl.trim(),
        thumbnail_url: formThumbnailUrl.trim(),
        category: formCategory,
        duration: formDuration.trim() || '10 min',
        instructor: formInstructor.trim() || 'Tena Holistic',
      });

      onNotify('success', editingVideo ? 'Video updated' : 'Video published', formTitle);
      setIsFormOpen(false);
      await fetchVideos();
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
      await adminService.deleteVideo(deleteTarget.id);
      onNotify('success', 'Video removed', deleteTarget.title);
      setDeleteTarget(null);
      await fetchVideos();
    } catch (err: any) {
      onNotify('error', 'Delete error', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase()) ||
    v.instructor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-heading tracking-tight">Holistic Video Sessions</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Manage free community movement routines, breathwork drills, and nutritional workshops
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="video-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos & categories..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14221C] text-[#1D2B24] dark:text-[#E2EBE6] focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            id="btn-add-video"
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Video</span>
          </button>
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Thumbnail</th>
                <th className="px-4 py-3.5">Title & Instructor</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5">Access</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                    <span className="inline-block animate-spin mr-2">●</span> Loading video directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                    No videos found. Click "Add New Video" to publish one.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-stone-900 relative group border border-stone-200 dark:border-stone-700">
                        <img
                          src={v.thumbnail_url || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300'}
                          alt={v.title}
                          className="w-full h-full object-cover"
                        />
                        <a
                          href={v.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                          title="Watch on YouTube"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-sm text-[#1D2B24] dark:text-[#E2EBE6]">
                        {v.title}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        Led by {v.instructor}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 capitalize">
                        {v.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-stone-600 dark:text-stone-300">
                      {v.duration}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        Always Free
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-1">
                      <button
                        id={`edit-video-${v.id}`}
                        onClick={() => handleOpenEdit(v)}
                        className="p-1.5 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Edit video"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-video-${v.id}`}
                        onClick={() => setDeleteTarget(v)}
                        className="p-1.5 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete video"
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

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            id="video-form-modal"
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 shadow-2xl p-6 text-[#1D2B24] dark:text-[#E2EBE6] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-base font-bold font-serif-heading">
                {editingVideo ? 'Edit Video Session' : 'Add New Video Session'}
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
                <label className="block font-semibold mb-1">Video Title *</label>
                <input
                  id="video-input-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. 10-Minute Morning Yoga for Spine & Nervous System"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">YouTube URL *</label>
                <input
                  id="video-input-url"
                  type="url"
                  required
                  value={formYoutubeUrl}
                  onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=sTANio_2E0Q"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <p className="mt-1 text-[11px] text-stone-400">
                  Thumbnail will be automatically extracted from YouTube, or upload a custom image below.
                </p>
              </div>

              {/* Thumbnail Image upload */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-2">
                <label className="block font-semibold">Thumbnail Image</label>
                <div className="flex items-center gap-4">
                  {formThumbnailUrl ? (
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-stone-900 border border-stone-300 shrink-0">
                      <img src={formThumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-10 rounded-lg border-2 border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-400 shrink-0">
                      <VideoIcon className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14221C] text-xs font-semibold cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isUploadingThumb ? 'Uploading...' : 'Upload Custom Image'}</span>
                      <input
                        id="video-thumb-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        disabled={isUploadingThumb}
                        className="hidden"
                      />
                    </label>
                    <input
                      id="video-thumb-url-input"
                      type="url"
                      value={formThumbnailUrl}
                      onChange={(e) => setFormThumbnailUrl(e.target.value)}
                      placeholder="Or enter direct image URL"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14221C] text-[11px] focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category / Topic</label>
                  <select
                    id="video-input-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="movement">Movement</option>
                    <option value="breathwork">Breathwork</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="sleep">Sleep</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Duration</label>
                  <input
                    id="video-input-duration"
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 10 min"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Instructor</label>
                  <input
                    id="video-input-instructor"
                    type="text"
                    value={formInstructor}
                    onChange={(e) => setFormInstructor(e.target.value)}
                    placeholder="Dr. Selamawit"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Note about free tier */}
              <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                Videos are always 100% free and open to all Tena community members.
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
                  id="btn-save-video-submit"
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-2"
                >
                  {isSaving && <span className="animate-spin text-xs">●</span>}
                  <span>{editingVideo ? 'Update Video' : 'Publish Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Video Session?"
        message="Are you sure you want to delete this video from the directory? Users will no longer be able to watch it in the Mini App."
        itemName={deleteTarget?.title}
        confirmLabel="Delete Video"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
