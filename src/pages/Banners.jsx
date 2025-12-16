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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold font-display text-gray-900">Banners Configuration</h1>
                <button
                    onClick={() => {
                        if (showForm && editingId) {
                            resetForm(); // Cancel edit
                        } else {
                            setShowForm(!showForm);
                            if (!showForm) resetForm(); // Reset if opening new
                        }
                    }}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                    {showForm ? 'Cancel' : 'Add New Banner'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-2xl">
                    <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Banner' : 'Add New Banner'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Paste the direct image address (ending in .jpg, .png, etc.), NOT a website link.
                                <br />
                                Tip: Right-click the image on the site and select "Copy Image Address".
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Summer Sale"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">External Link / Screen path (Optional)</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="/products or https://..."
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
                            >
                                {submitting ? 'Saving...' : (editingId ? 'Update Banner' : 'Create Banner')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Banners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div key={banner._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="relative aspect-video bg-gray-100">
                            <img
                                src={banner.imageUrl}
                                alt={banner.title || 'Banner'}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = 'https://via.placeholder.com/300x150?text=Invalid+Image'}
                            />
                            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(banner)}
                                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 shadow-sm"
                                    title="Edit"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(banner._id)}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-sm"
                                    title="Delete"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                Order: {banner.order}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 truncate">{banner.title || 'Untitled Banner'}</h3>
                            <p className="text-sm text-gray-500 truncate mt-1">{banner.link || 'No link'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {banners.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                    No banners configured. Click "Add New Banner" to start.
                </div>
            )}
        </div>
    );
}
