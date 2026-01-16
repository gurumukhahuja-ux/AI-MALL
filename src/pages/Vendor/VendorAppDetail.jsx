import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import AppDetail from '../../Components/Vendor/AppDetail';
import vendorService from '../../services/vendorService';
import { Loader2, AlertCircle } from 'lucide-react';
import PrimaryButton from '../../Components/Vendor/PrimaryButton';

const VendorAppDetail = () => {
    const { appId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fetchData = async () => {
        try {
            console.log('[VendorAppDetail] Starting fetch for', appId);
            setLoading(true);
            const detailData = await vendorService.getAppDetails(appId);
            console.log('[VendorAppDetail] Data received:', detailData);
            setData(detailData);
            setError(null);
        } catch (err) {
            console.error('[VendorAppDetail] Fetch failed:', err);
            setError('Failed to load app details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [appId]);

    const handleDeactivate = async () => {
        try {
            await vendorService.deactivateApp(appId);
            // Refresh data to show Inactive status
            fetchData();
        } catch (err) {
            alert('Deactivation failed. Please try again.');
        }
    };

    const handleReactivate = async () => {
        try {
            await vendorService.reactivateApp(appId);
            fetchData();
        } catch (err) {
            alert('Reactivation failed. Please try again.');
        }
    };



    const handleSubmitForReview = async () => {
        try {
            await vendorService.submitForReview(appId);
            alert("Successfully submitted for review"); // Added success popup
            fetchData();
        } catch (err) {
            console.error('[VendorAppDetail] Submission failed detailed:', err);
            const msg = err.response?.data?.error || err.message || 'Submission failed';
            alert(`Submission failed: ${msg}`);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await vendorService.deleteApp(appId);
            if (res.deletionStatus === 'Pending') {
                alert("Deletion request submitted to admin. Pending approval.");
                fetchData();
            } else {
                navigate('/vendor/apps'); // Redirect to app list after permanent delete
            }
        } catch (err) {
            alert('Deletion failed. Please try again.');
        }
    };

    const handleUpdateUrl = async (newUrl) => {
        try {
            await vendorService.updateApp(appId, { url: newUrl });
            fetchData();
        } catch (err) {
            alert('Update failed. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-sm">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-[#8b5cf6]/10 border-t-[#8b5cf6] animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={24} className="text-[#8b5cf6] animate-pulse" />
                    </div>
                </div>
                <p className="text-[#8b5cf6] font-black uppercase tracking-[0.2em] mt-6 animate-pulse text-xs">Syncing Neural Node...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50/80 backdrop-blur-3xl border border-red-100 rounded-[40px] p-12 text-center max-w-lg mx-auto mt-12 shadow-lg">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Signal Interrupted</h3>
                <p className="text-gray-500 font-medium mb-8">{error}</p>
                <div className="flex justify-center">
                    <button
                        onClick={fetchData}
                        className="bg-red-500 text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <AppDetail
                app={data.agent}
                usage={data.usage}
                onDeactivate={handleDeactivate}
                onReactivate={handleReactivate}
                onSubmitForReview={handleSubmitForReview}
                onDelete={handleDelete}
                onUpdateUrl={handleUpdateUrl}
                onBack={() => navigate('/vendor/apps')}
            />
        </div>
    );
};

export default VendorAppDetail;
