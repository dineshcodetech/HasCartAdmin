import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../constants';
import { API_BASE_URL } from '../config';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Banners() {
    const { token } = useAuth();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // Track which banner is being edited
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        link: '',
        order: 0,
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_BANNERS}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setBanners(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_BANNERS}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // If we deleted the one being edited, reset form
                if (editingId === id) {
                    resetForm();
                }
                fetchBanners();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to delete banner');
        }
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.imageUrl) return alert('Image URL is required');

        setSubmitting(true);
        try {
            const url = editingId
                ? `${API_BASE_URL}${API_ENDPOINTS.ADMIN_BANNERS}/${editingId}`
                : `${API_BASE_URL}${API_ENDPOINTS.ADMIN_BANNERS}`;

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                resetForm();
                fetchBanners();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert(`Failed to ${editingId ? 'update' : 'create'} banner`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !banners.length) return <LoadingSpinner />;

    return (
        <div className="p-8 min-h-screen">
            <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold tracking-wide text-primary mb-2">Banners.</h1>
                    <p className="text-xs text-gray-400 tracking-widest uppercase">Configuration</p>
                </div>
                <button
                    onClick={() => {
                        if (showForm && editingId) {
                            resetForm();
                        } else {
                            setShowForm(!showForm);
                            if (!showForm) resetForm();
                        }
                    }}
                    className="px-6 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-primary text-primary hover:opacity-70 transition-all active:scale-95"
                >
                    {showForm ? 'Cancel' : 'Add New Banner'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-2xl">
                    <h2 className="text-sm font-bold tracking-wider uppercase text-gray-500 mb-6">
                        {editingId ? 'Edit Banner' : 'Add New Banner'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Image URL *</label>
                            <input
                                type="text"
                                className="w-full border-b border-gray-300 py-2 px-1 text-sm bg-transparent outline-none focus:border-primary text-primary font-bold"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                required
                            />
                            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-tight">
                                Paste the direct image address (ending in .jpg, .png, etc.)
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Title (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-300 py-2 px-1 text-sm bg-transparent outline-none focus:border-primary text-primary font-bold"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Banner Title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Display Order</label>
                                <input
                                    type="number"
                                    className="w-full border-b border-gray-300 py-2 px-1 text-sm bg-transparent outline-none focus:border-primary text-primary font-bold"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">External Link / Screen path (Optional)</label>
                            <input
                                type="text"
                                className="w-full border-b border-gray-300 py-2 px-1 text-sm bg-transparent outline-none focus:border-primary text-primary font-bold"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="/products or https://..."
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-secondary text-white px-8 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold uppercase tracking-widest text-xs shadow-md active:scale-95 transition-all"
                            >
                                {submitting ? 'Saving...' : (editingId ? 'Update Banner' : 'Create Banner')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {banners.map((banner) => (
                    <div key={banner._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                        <div className="relative aspect-video bg-gray-50">
                            <img
                                src={banner.imageUrl}
                                alt={banner.title || 'Banner'}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = 'https://via.placeholder.com/300x150?text=Invalid+Image'}
                            />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={() => handleEdit(banner)}
                                    className="bg-white text-primary p-3 rounded-full hover:bg-secondary hover:text-white shadow-lg transition-all active:scale-90"
                                    title="Edit"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(banner._id)}
                                    className="bg-white text-red-500 p-3 rounded-full hover:bg-red-500 hover:text-white shadow-lg transition-all active:scale-90"
                                    title="Delete"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                Order: {banner.order}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-primary truncate tracking-wide">{banner.title || 'Untitled Banner'}</h3>
                            <p className="text-xs text-gray-400 truncate mt-1 tracking-tight">{banner.link || 'No external link'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {banners.length === 0 && !loading && (
                <div className="text-center py-24 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-400 italic">No banners configured yet.</p>
                </div>
            )}
        </div>
    );
}
