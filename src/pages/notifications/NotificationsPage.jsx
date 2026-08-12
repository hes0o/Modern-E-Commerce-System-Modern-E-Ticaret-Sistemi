import { useState, useEffect, useCallback } from "react";
import {
    Bell,
    Package,
    ShoppingCart,
    UserPlus,
    Settings,
    CheckCheck,
    Loader2,
    Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { formatDate } from "@/utils/formatters";

const ICONS = {
    stock: Package,
    order: ShoppingCart,
    user: UserPlus,
    system: Settings,
};

export default function NotificationsPage() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (activeTab !== "all") {
                params.notification_type = activeTab;
            }
            const res = await api.get("/api/admin/notifications", { params });
            const data = res.data.data;
            const items = data.items || [];

            setNotifications(items);
            setUnreadCount(data.unread_count || 0);

            if (items.length > 0) {
                // Önceden seçili olan varsa onu koru, yoksa ilkini seç
                setSelectedNotification((prev) => {
                    if (prev) {
                        const found = items.find((i) => i.id === prev.id);
                        return found || items[0];
                    }
                    return items[0];
                });
            } else {
                setSelectedNotification(null);
            }
        } catch (err) {
            console.error("Bildirimler yüklenemedi:", err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const markAllAsRead = async () => {
        try {
            await api.patch("/api/admin/notifications/read-all");
            loadNotifications();
        } catch (err) {
            console.error("Tümünü okundu işaretleme hatası:", err);
        }
    };

    const handleSelectNotification = async (notification) => {
        setSelectedNotification(notification);

        if (!notification.is_read) {
            try {
                await api.patch(`/api/admin/notifications/${notification.id}/read`);
                setNotifications((prev) =>
                    prev.map((item) =>
                        item.id === notification.id ? { ...item, is_read: true } : item
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch (err) {
                console.error("Bildirim okundu işaretleme hatası:", err);
            }
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await api.delete(`/api/admin/notifications/${id}`);
            const updated = notifications.filter((item) => item.id !== id);
            setNotifications(updated);

            if (updated.length > 0) {
                setSelectedNotification(updated[0]);
            } else {
                setSelectedNotification(null);
            }
        } catch (err) {
            console.error("Bildirim silme hatası:", err);
        }
    };

    const getTargetLink = (n) => {
        if (!n) return "/dashboard";
        if (n.type === "stock") return "/stock";
        if (n.type === "order") return n.related_entity_id ? `/orders/${n.related_entity_id}` : "/orders";
        if (n.type === "user") return "/users";
        if (n.type === "system") return "/settings";
        return "/dashboard";
    };

    return (
        <div className="space-y-6">
            {/* Sayfa Başlığı */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bildirim Merkezi</h1>
                    <p className="page-subtitle">
                        Sistem uyarıları, siparişler, kullanıcı kayıtları ve mağaza bildirimlerini gerçek zamanlı yönetin.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold">
                        {unreadCount} Okunmamış
                    </span>

                    <button
                        onClick={markAllAsRead}
                        className="btn btn-secondary flex items-center gap-1.5 text-xs"
                    >
                        <CheckCheck size={16} />
                        Tümünü Okundu İşaretle
                    </button>
                </div>
            </div>

            {/* Filtreler */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-xl font-medium transition text-xs sm:text-sm ${
                        activeTab === "all"
                            ? "bg-indigo-600 text-white shadow-md"
                            : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                >
                    🔔 Tümü
                </button>

                <button
                    onClick={() => setActiveTab("stock")}
                    className={`px-4 py-2 rounded-xl font-medium transition text-xs sm:text-sm ${
                        activeTab === "stock"
                            ? "bg-red-600 text-white shadow-md"
                            : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                >
                    🚨 Kritik Stok
                </button>

                <button
                    onClick={() => setActiveTab("order")}
                    className={`px-4 py-2 rounded-xl font-medium transition text-xs sm:text-sm ${
                        activeTab === "order"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                >
                    📦 Siparişler
                </button>

                <button
                    onClick={() => setActiveTab("user")}
                    className={`px-4 py-2 rounded-xl font-medium transition text-xs sm:text-sm ${
                        activeTab === "user"
                            ? "bg-emerald-600 text-white shadow-md"
                            : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                >
                    👤 Kullanıcı Kayıtları
                </button>

                <button
                    onClick={() => setActiveTab("system")}
                    className={`px-4 py-2 rounded-xl font-medium transition text-xs sm:text-sm ${
                        activeTab === "system"
                            ? "bg-slate-700 text-white shadow-md"
                            : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                >
                    ⚙ Sistem
                </button>
            </div>

            {/* Ana Alan */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Sol Panel - Bildirim Listesi */}
                <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-indigo-600" />
                            <h2 className="font-semibold text-slate-800 text-sm">
                                Bildirimler
                            </h2>
                        </div>

                        <span className="text-xs text-slate-500 font-medium">
                            {notifications.length} kayıt
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                        {loading ? (
                            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
                                <Loader2 size={28} className="animate-spin text-indigo-600" />
                                <span className="text-xs">Yükleniyor...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-20 text-center">
                                <Bell size={40} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-sm text-slate-500 font-medium">
                                    Bildirim bulunmuyor.
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const Icon = ICONS[notification.type] || Bell;
                                const isSelected = selectedNotification?.id === notification.id;

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleSelectNotification(notification)}
                                        className={`cursor-pointer px-4 py-3.5 transition text-left ${
                                            isSelected
                                                ? "bg-indigo-50/80 border-l-4 border-indigo-600"
                                                : "hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                    notification.type === "stock"
                                                        ? "bg-red-100 text-red-600"
                                                        : notification.type === "order"
                                                        ? "bg-blue-100 text-blue-600"
                                                        : notification.type === "user"
                                                        ? "bg-emerald-100 text-emerald-600"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                <Icon size={18} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={`text-xs font-bold truncate ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                                                        {notification.title}
                                                    </h3>

                                                    {!notification.is_read && (
                                                        <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 ml-1" />
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-500 mt-1 truncate">
                                                    {notification.message}
                                                </p>

                                                <p className="text-[10px] text-slate-400 mt-1.5">
                                                    {formatDate(notification.created_at, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sağ Panel - Bildirim Detayı */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[650px] flex flex-col">
                        {selectedNotification ? (
                            <>
                                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {selectedNotification.title}
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {formatDate(selectedNotification.created_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {!selectedNotification.is_read ? (
                                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                            Okunmadı
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                            Okundu
                                        </span>
                                    )}
                                </div>

                                <div className="p-8 space-y-6 flex-1">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            Bildirim İçeriği
                                        </h3>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                                            <p className="text-slate-800 text-sm leading-relaxed">
                                                {selectedNotification.message}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            Sistem Detayları
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-xl border border-slate-200 p-4 bg-white">
                                                <p className="text-[11px] text-slate-400">Bildirim Türü</p>
                                                <p className="font-semibold text-xs text-slate-800 mt-1 capitalize">
                                                    {selectedNotification.type}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-slate-200 p-4 bg-white">
                                                <p className="text-[11px] text-slate-400">İlişkili Varlık ID</p>
                                                <p className="font-semibold text-xs text-slate-800 mt-1">
                                                    {selectedNotification.related_entity_id || "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex gap-3 justify-end rounded-b-2xl">
                                    <button
                                        onClick={() => handleDeleteNotification(selectedNotification.id)}
                                        className="btn btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-1.5 text-xs"
                                    >
                                        <Trash2 size={14} />
                                        Bildirimi Sil
                                    </button>

                                    <button
                                        onClick={() => navigate(getTargetLink(selectedNotification))}
                                        className="btn btn-primary text-xs"
                                    >
                                        İlgili Detaya Git →
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                                <Bell size={50} className="text-slate-300 mb-4" />
                                <h2 className="text-base font-bold text-slate-700">Bildirim Seçilmedi</h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Listeden bir bildirim seçerek detaylarını inceleyebilirsiniz.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}