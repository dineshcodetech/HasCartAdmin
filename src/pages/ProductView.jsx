import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { apiCall } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { AMAZON_SEARCH_INDEX } from '../constants'

function ProductView() {
    const { asin } = useParams()
    const [searchParams] = useSearchParams()
    const referralCode = searchParams.get('ref')
    const urlAgentId = searchParams.get('agentId') // Capture explicit agent ID from URL

    const [product, setProduct] = useState(null)
    const [agent, setAgent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { isAuthenticated, token } = useAuth()

    const [showEditModal, setShowEditModal] = useState(false)
    const [editFormData, setEditFormData] = useState({
        category: '',
        searchIndex: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchAndTrack = async () => {
            try {
                setLoading(true)

                // 1. Fetch Agent Details if referral code exists
                let agentId = null;
                let currentAgent = null;
                if (referralCode) {
                    try {
                        const agentRes = await apiCall(`/api/referral/validate/${referralCode}`)
                        if (agentRes.ok && agentRes.data?.data) {
                            currentAgent = agentRes.data.data;
                            setAgent(currentAgent)
                            agentId = currentAgent._id
                        }
                    } catch (agentErr) {
                        console.error('Agent validation failed:', agentErr)
                    }
                }

                // 2. Get product details from Amazon API via backend
                const res = await apiCall(`/api/products/${asin}`)

                if (res.ok && res.data?.data) {
                    const item = res.data.data
                    setProduct(item)

                    // 3. Track the click with the referral code and agent ID
                    // Priority for attribution:
                    // 1. Validated agent from referral code
                    // 2. Explicit agentId from URL
                    // 3. Logged in user if they are an agent/admin
                    const finalAgentId = agentId || urlAgentId;

                    try {
                        await apiCall('/api/analytics/track-click', {
                            method: 'POST',
                            body: JSON.stringify({
                                asin: item.ASIN,
                                productName: item.ItemInfo?.Title?.DisplayValue,
                                category: item.BrowseNodeInfo?.BrowseNodes?.[0]?.DisplayName || item.ItemInfo?.Classifications?.ProductGroup?.DisplayValue || 'Uncategorized',
                                price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
                                imageUrl: item.Images?.Primary?.Large?.URL || item.Images?.Primary?.Medium?.URL,
                                productUrl: item.DetailPageURL,
                                referralCode: referralCode || '',
                                agentId: finalAgentId
                            })
                        })
                    } catch (trackErr) {
                        console.error('Tracking failed but continuing:', trackErr)
                    }
                } else {
                    setError('Product not found or unavailable on Amazon.')
                }
            } catch (err) {
                setError('Failed to connect to Amazon services. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        fetchAndTrack()
    }, [asin, referralCode, urlAgentId])

    const handleContinue = () => {
        if (product?.DetailPageURL) {
            window.location.href = product.DetailPageURL
        }
    }

    const handleShare = () => {
        const agentCode = user?.referralCode || agent?.referralCode || referralCode || ''
        const agentId = user?._id || user?.id || ''
        
        let shareUrl = `${window.location.origin}/product/${asin}`
        const params = []
        if (agentCode) params.push(`ref=${agentCode}`)
        if (agentId) params.push(`agentId=${agentId}`)
        
        if (params.length > 0) {
            shareUrl += `?${params.join('&')}`
        }

        navigator.clipboard.writeText(shareUrl)
        alert('Share link copied to clipboard!')
    }

    const openEditModal = async () => {
        try {
            // Fetch current details from DB to populate form
            const res = await apiCall(`/api/products/${asin}/details`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok && res.data?.data) {
                const { localProduct, smartCategory } = res.data.data
                setEditFormData({
                    category: localProduct?.category || '',
                    searchIndex: localProduct?.searchIndex || smartCategory || 'All'
                })
            }
            setShowEditModal(true)
        } catch (err) {
            console.error('Failed to fetch product details', err)
            // Fallback to defaults
            setShowEditModal(true)
        }
    }

    const handleSaveProduct = async () => {
        try {
            setSaving(true)
            const res = await apiCall(`/api/products/${asin}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            })

            if (res.ok) {
                setShowEditModal(false)
                // Optionally refresh product data
                alert('Product category updated successfully!')
            } else {
                alert('Failed to update product')
            }
        } catch (err) {
            console.error('Update failed', err)
            alert('Update failed')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-8">
                <LoadingSpinner size="large" />
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-pulse">Syncing with Amazon Registry...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-black text-primary mb-2 uppercase tracking-tight">Access Denied.</h2>
                <p className="text-gray-400 text-sm max-w-xs mb-8">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20"
                >
                    Retry Connection
                </button>
            </div>
        )
    }

    const title = product.ItemInfo?.Title?.DisplayValue
    const imageUrl = product.Images?.Primary?.Large?.URL || product.Images?.Primary?.Medium?.URL
    const price = product.Offers?.Listings?.[0]?.Price?.DisplayAmount

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden border border-gray-100 flex flex-col">
                {/* Product Image */}
                <div className="relative h-80 bg-white flex items-center justify-center p-12">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
                    />
                    {agent && (
                        <div className="absolute top-6 right-6 bg-secondary text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-secondary/30">
                            Trusted HasCart Portfolio
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="p-10 pt-0 text-center">
                    {agent && (
                        <div className="mb-6 flex flex-col items-center">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Recommended By</span>
                            <span className="text-sm font-black text-secondary uppercase tracking-tight">{agent.name}</span>
                        </div>
                    )}

                    <h1 className="text-xl font-black text-primary mb-4 leading-tight">
                        {title}
                    </h1>

                    <div className="flex items-center justify-center gap-4 mb-10">
                        <div className="h-[1px] bg-gray-100 flex-1" />
                        <span className="text-2xl font-black text-secondary">{price || 'View Price'}</span>
                        <div className="h-[1px] bg-gray-100 flex-1" />
                    </div>

                    <p className="text-gray-400 text-[10px] uppercase font-black tracking-[0.1em] mb-10 leading-relaxed px-4">
                        You are being redirected to Amazon to complete your purchase securely.
                    </p>

                    <button
                        onClick={handleContinue}
                        className="w-full py-5 bg-black text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary transition-all shadow-xl shadow-black/10 active:scale-95 group flex items-center justify-center gap-3"
                    >
                        View on Amazon
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    {(isAuthenticated || referralCode) && (
                        <button
                            onClick={handleShare}
                            className="w-full mt-4 py-4 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>Share & Earn</span>
                            <span className="text-xs">🔗</span>
                        </button>
                    )}

                    <p className="mt-8 text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                        Amazon Verified Seller
                    </p>
                </div>
            </div>

            <p className="mt-12 text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                Powered by <span className="text-primary">HasCart</span>
            </p>

            {/* Admin Edit Trigger */}
            {isAuthenticated && (
                <button
                    onClick={openEditModal}
                    className="fixed bottom-6 right-6 w-12 h-12 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
                    title="Edit Product Category"
                >
                    <span className="text-xl">✎</span>
                </button>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Edit Product Category</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-black">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Internal Category (Tag)</label>
                                <input
                                    type="text"
                                    value={editFormData.category}
                                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                                    placeholder="e.g. Mobiles, Men's Shoes"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">
                                    System will automatically map this to Amazon Search Index.
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Amazon Search Index</label>
                                <select
                                    value={editFormData.searchIndex}
                                    onChange={(e) => setEditFormData({ ...editFormData, searchIndex: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-black outline-none"
                                >
                                    {Object.entries(AMAZON_SEARCH_INDEX).map(([key, value]) => (
                                        <option key={key} value={value}>{value}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProduct}
                                disabled={saving}
                                className="px-6 py-2 text-sm font-bold bg-black text-white rounded-lg hover:opacity-80 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductView
