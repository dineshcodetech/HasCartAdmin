import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBanners } from '../hooks/useBanners';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getOptimizedImageUrl } from '../utils/imageUtils';

export default function Banners() {
    const { token } = useAuth();
    const {
        banners,
        loading,
        error: fetchError,
        refetch,
        createBanner,
        updateBanner,
        deleteBanner
    } = useBanners();

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        link: '',
        order: 0,
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);
    const [operationError, setOperationError] = useState(null);
    const [operationSuccess, setOperationSuccess] = useState(null);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;

        setSubmitting(true);
        setOperationError(null);

        const result = await deleteBanner(id);

        if (result.success) {
            setOperationSuccess('Banner deleted successfully');
            if (editingId === id) resetForm();
            setTimeout(() => setOperationSuccess(null), 3000);
        } else {
            setOperationError(result.error);
        }
        setSubmitting(false);
    };

    const handleEdit = (banner) => {
        setEditingId(banner._id);
        setFormData({
            title: banner.title || '',
            imageUrl: banner.imageUrl || '',
            link: banner.link || '',
            order: banner.order || 0,
            isActive: banner.isActive !== undefined ? banner.isActive : true
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ title: '', imageUrl: '', link: '', order: 0, isActive: true });
        setOperationError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.imageUrl) return setOperationError('Image URL is required');

        setSubmitting(true);
        setOperationError(null);

        const result = editingId
            ? await updateBanner(editingId, formData)
            : await createBanner(formData);

        if (result.success) {
            setOperationSuccess(`Banner ${editingId ? 'updated' : 'created'} successfully`);
            resetForm();
            setTimeout(() => setOperationSuccess(null), 3000);
        } else {
            setOperationError(result.error);
        }
        setSubmitting(false);
    };

    return (
        <div className="p-8 min-h-screen">
            <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold tracking-wide text-primary mb-2">Banners.</h1>
                    <p className="text-xs text-gray-400 tracking-widest uppercase">Configuration & Visuals</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={refetch}
                        className="px-6 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-gray-200 text-gray-500 hover:text-primary transition-all"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            if (showForm) {
                                resetForm();
                            } else {
                                resetForm(); // Ensures clean state
                                setShowForm(true);
                            }
                        }}
                        className="px-6 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-primary text-primary hover:opacity-70 transition-all active:scale-95"
                    >
                        {showForm ? 'Cancel' : 'Add New Banner'}
                    </button>
                </div>
            </div>

            {/* Error Messages */}
            {(fetchError || operationError) && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <p className="text-sm font-bold">{operationError || fetchError}</p>
                </div>
            )}

            {/* Success Message */}
            {operationSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-xl mb-8 flex items-center gap-3">
                    <span className="text-xl">✓</span>
                    <p className="text-sm font-bold">{operationSuccess}</p>
                </div>
            )}

            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-12 max-w-2xl transform transition-all">
                    <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400 mb-8 pb-4 border-b border-gray-50">
                        {editingId ? 'Modify Existing Banner' : 'Add New Banner'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-bold">Image URL *</label>
                            <input
                                type="text"
                                id="imageUrl"
                                className="w-full border-b-2 border-gray-100 py-3 px-1 text-sm bg-transparent outline-none focus:border-primary text-primary font-bold transition-colors"
                                value={formData.imageUrl}
                                onChange={(e) => {
                                    // Auto-convert URLs using the utility function
                                    const url = getOptimizedImageUrl(e.target.value, { width: 1200 });
                                    setFormData({ ...formData, imageUrl: url });
                                }}
                                placeholder="Paste image URL (Unsplash & Drive supported)"
                                required
                            />
                            {formData.imageUrl && (
                                <div className="mt-4 p-2 border border-dashed border-gray-100 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[8px] uppercase font-black text-gray-300">Live Preview:</p>
                                        {formData.imageUrl.includes('images.unsplash.com') && (
                                            <span className="text-[8px] text-secondary font-bold uppercase tracking-widest animate-pulse">✨ Unsplash Optimized</span>
                                        )}
                                        {(formData.imageUrl.includes('drive.google.com/thumbnail') || formData.imageUrl.includes('googleusercontent.com')) && (
                                            <span className="text-[8px] text-blue-500 font-bold uppercase tracking-widest animate-pulse">☁️ Drive Optimized</span>
                                        )}
                                    </div>
                                    <div className="relative w-full aspect-[21/9] min-h-[120px] rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner">
                                        <img
                                            key={formData.imageUrl} // Forces re-mount on URL change to reset internal states
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/600x300?text=Invalid+Image+URL';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] text-gray-400 mt-3 italic">
                                Use high-quality direct links (JPG, PNG, WebP)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-bold">Title (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full border-b-2 border-gray-100 py-3 px-1 text-sm bg-transparent outline-none focus:border-primary text-primary font-bold transition-colors"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Summer Sale 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-bold">Display Order</label>
                                <input
                                    type="number"
                                    className="w-full border-b-2 border-gray-100 py-3 px-1 text-sm bg-transparent outline-none focus:border-primary text-primary font-bold transition-colors"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-bold">Navigation Link (Optional)</label>
                            <input
                                type="text"
                                className="w-full border-b-2 border-gray-100 py-3 px-1 text-sm bg-transparent outline-none focus:border-primary text-primary font-bold transition-colors"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="/products or https://..."
                            />
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <label className="flex items-center cursor-pointer gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 accent-secondary"
                                />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Active / Visible to users</span>
                            </label>
                        </div>

                        <div className="flex justify-end pt-4 gap-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-secondary text-white px-10 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 font-bold uppercase tracking-widest text-[10px] shadow-[0_10px_20px_-10px_rgba(34,197,94,0.5)] active:scale-95 transition-all"
                            >
                                {submitting ? 'Processing...' : (editingId ? 'Update Banner' : 'Add Banner')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && !banners.length ? (
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {banners.map((banner) => (
                            <div key={banner._id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-500 ${!banner.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                <div className="relative aspect-[21/9] bg-gray-50 overflow-hidden">
                                    <img
                                        src={getOptimizedImageUrl(banner.imageUrl, { width: 800 })}
                                        alt={banner.title || 'Banner'}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/600x300?text=Invalid+Image+URL'}
                                    />
                                    {!banner.isActive && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-[0.2em] border border-white/30">Inactive</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                        <button
                                            onClick={() => handleEdit(banner)}
                                            className="bg-white text-primary p-4 rounded-2xl hover:bg-secondary hover:text-white shadow-xl transition-all active:scale-90 transform translate-y-4 group-hover:translate-y-0"
                                            title="Edit"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner._id)}
                                            className="bg-white text-red-500 p-4 rounded-2xl hover:bg-red-500 hover:text-white shadow-xl transition-all active:scale-90 transform translate-y-4 group-hover:translate-y-0 transition-delay-100"
                                            title="Delete"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4 bg-white shadow-lg text-primary text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest z-10">
                                        #{banner.order}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-primary truncate tracking-wide text-lg mb-2">{banner.title || 'Promotional Asset'}</h3>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <p className="text-[10px] truncate tracking-tight font-medium uppercase">{banner.link || 'Internal Route only'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {banners.length === 0 && !loading && (
                        <div className="text-center py-32 bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl mt-12">
                            <div className="text-4xl mb-4 opacity-20">🖼️</div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No banners found in your gallery.</p>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                                className="mt-6 px-8 py-2 text-[10px] font-bold tracking-[0.15em] uppercase border border-primary text-primary hover:bg-primary hover:text-white transition-all active:scale-95 rounded-lg"
                            >
                                Add New Banner
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
