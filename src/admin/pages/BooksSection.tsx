import React, { useState, useEffect } from 'react';
import { AdminBook } from '../types';
import { adminService } from '../services/adminSupabase';
import { ConfirmModal } from '../components/ConfirmModal';
import { Plus, Pencil, Trash2, Search, Upload, BookOpen, DollarSign, X, Check, FileText } from 'lucide-react';

interface BooksSectionProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const BooksSection: React.FC<BooksSectionProps> = ({ onNotify }) => {
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Partial<AdminBook> | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<AdminBook | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('Dr. Selamawit Tena');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Wellness');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formContentUrl, setFormContentUrl] = useState('');
  const [formPages, setFormPages] = useState(120);
  const [formReadTime, setFormReadTime] = useState(45);
  const [formIsPaid, setFormIsPaid] = useState(false);
  const [formPrice, setFormPrice] = useState(0);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await adminService.getBooks();
      setBooks(data);
    } catch (err: any) {
      onNotify('error', 'Failed to load books', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpenCreate = () => {
    setEditingBook(null);
    setFormTitle('');
    setFormAuthor('Dr. Selamawit Tena');
    setFormDescription('');
    setFormCategory('Wellness');
    setFormCoverUrl('');
    setFormContentUrl('');
    setFormPages(120);
    setFormReadTime(45);
    setFormIsPaid(false);
    setFormPrice(0);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (book: AdminBook) => {
    setEditingBook(book);
    setFormTitle(book.title);
    setFormAuthor(book.author);
    setFormDescription(book.description);
    setFormCategory(book.category);
    setFormCoverUrl(book.cover_url);
    setFormContentUrl(book.content_url);
    setFormPages(book.pages);
    setFormReadTime(book.read_time_minutes);
    setFormIsPaid(book.is_paid);
    setFormPrice(book.price);
    setIsFormOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const publicUrl = await adminService.uploadMedia(file, 'books');
      setFormCoverUrl(publicUrl);
      onNotify('success', 'Cover uploaded to "media" bucket', file.name);
    } catch (err: any) {
      onNotify('error', 'Upload failed', err.message);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onNotify('error', 'Title is required');
      return;
    }

    setIsSaving(true);
    try {
      await adminService.saveBook({
        id: editingBook?.id,
        title: formTitle.trim(),
        author: formAuthor.trim() || 'Tena Holistic',
        description: formDescription.trim(),
        category: formCategory.trim() || 'Wellness',
        cover_url: formCoverUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
        content_url: formContentUrl.trim() || 'https://example.com/sample.pdf',
        pages: Number(formPages),
        read_time_minutes: Number(formReadTime),
        is_paid: formIsPaid,
        price: formIsPaid ? Number(formPrice) : 0,
      });

      onNotify('success', editingBook ? 'Book updated' : 'Book published', formTitle);
      setIsFormOpen(false);
      await fetchBooks();
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
      await adminService.deleteBook(deleteTarget.id);
      onNotify('success', 'Book removed', deleteTarget.title);
      setDeleteTarget(null);
      await fetchBooks();
    } catch (err: any) {
      onNotify('error', 'Delete error', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-heading tracking-tight">Holistic Health Books & Guides</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Publish wellness literature, upload cover artwork, and configure pricing tiers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="book-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books & authors..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14221C] text-[#1D2B24] dark:text-[#E2EBE6] focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            id="btn-add-book"
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Cover</th>
                <th className="px-4 py-3.5">Title & Author</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Tier</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                    <span className="inline-block animate-spin mr-2">●</span> Loading books...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                    No books in catalog. Click "Add New Book" to publish one.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs">
                        <img
                          src={b.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-sm text-[#1D2B24] dark:text-[#E2EBE6]">
                        {b.title}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        by {b.author} • {b.pages} pages ({b.read_time_minutes} min read)
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {b.is_paid ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium">
                      {b.is_paid ? `$${b.price.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-1">
                      <button
                        id={`edit-book-${b.id}`}
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Edit book"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-book-${b.id}`}
                        onClick={() => setDeleteTarget(b)}
                        className="p-1.5 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete book"
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
            id="book-form-modal"
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 shadow-2xl p-6 text-[#1D2B24] dark:text-[#E2EBE6] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-base font-bold font-serif-heading">
                {editingBook ? 'Edit Book' : 'Add New Book to Catalog'}
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
                <label className="block font-semibold mb-1">Book Title *</label>
                <input
                  id="book-input-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., The Circadian Code of the Horn"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Author / Practitioner</label>
                  <input
                    id="book-input-author"
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Dr. Selamawit Tena"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <input
                    id="book-input-category"
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Herbal Medicine, Longevity"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Book Synopsis & Overview</label>
                <textarea
                  id="book-input-desc"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="A short overview of what readers will learn..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Cover Image Upload (Prompt: cover image upload to the "media" bucket) */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-2">
                <label className="block font-semibold">Cover Image (Uploads to "media" bucket)</label>
                <div className="flex items-center gap-4">
                  {formCoverUrl ? (
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-stone-100 border border-stone-300 shrink-0">
                      <img src={formCoverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-16 rounded-lg border-2 border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-400 shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14221C] text-xs font-semibold cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isUploadingCover ? 'Uploading to Media...' : 'Choose File to Upload'}</span>
                      <input
                        id="book-cover-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        disabled={isUploadingCover}
                        className="hidden"
                      />
                    </label>
                    <input
                      id="book-cover-url-input"
                      type="url"
                      value={formCoverUrl}
                      onChange={(e) => setFormCoverUrl(e.target.value)}
                      placeholder="Or enter direct image URL (https://...)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14221C] text-[11px] focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Content / File URL */}
              <div>
                <label className="block font-semibold mb-1">Content / PDF Download URL</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="book-content-url-input"
                    type="url"
                    value={formContentUrl}
                    onChange={(e) => setFormContentUrl(e.target.value)}
                    placeholder="https://example.com/books/my-book.pdf"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Free vs Paid Toggle (Prompt: toggle Free/Paid, price field disabled/hidden if Free) */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-xs">Pricing Tier</p>
                    <p className="text-[11px] text-stone-500">Enable free access or set purchase price</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="book-toggle-free"
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
                      id="book-toggle-paid"
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
                    <label className="block font-semibold mb-1">Book Price (USD) *</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="book-input-price"
                        type="number"
                        step="0.5"
                        min="0.5"
                        required={formIsPaid}
                        value={formPrice}
                        onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                        placeholder="8.50"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14221C] text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Total Pages</label>
                  <input
                    id="book-input-pages"
                    type="number"
                    min="1"
                    value={formPages}
                    onChange={(e) => setFormPages(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Read Time (minutes)</label>
                  <input
                    id="book-input-readtime"
                    type="number"
                    min="1"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(parseInt(e.target.value) || 45)}
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
                  id="btn-save-book-submit"
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-2"
                >
                  {isSaving && <span className="animate-spin text-xs">●</span>}
                  <span>{editingBook ? 'Update Book' : 'Save & Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Book from Catalog?"
        message="Are you sure you want to delete this book? It will no longer be available in the Telegram Mini App library."
        itemName={deleteTarget?.title}
        confirmLabel="Delete Book"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
