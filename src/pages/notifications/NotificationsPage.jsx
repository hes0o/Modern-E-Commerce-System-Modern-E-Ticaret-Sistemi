import { useState } from "react";
import {
    Bell,
    Package,
    ShoppingCart,
    UserPlus,
    Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const notificationsData = [
    {
        id: 1,
        type: "stock",
        title: "Kritik Stok Uyarısı",
        message: "Nike Air Max ürününün stoğu 2 adede düştü.",
        description:
            "Nike Air Max ürünü kritik stok seviyesine ulaştı. Mevcut stok yalnızca 2 adet kaldı. Satışlar devam ederse ürün tamamen tükenebilir. En kısa sürede tedarik edilmesi önerilir.",
        time: "2 dakika önce",
        unread: true,
        link: "/stock",
    },

    {
        id: 2,
        type: "order",
        title: "Yeni Sipariş",
        message: "Sipariş #ORD-01053 oluşturuldu.",
        description:
            "Ahmet Yılmaz tarafından verilen sipariş başarıyla sisteme kaydedildi. Ödeme onaylandı ve sipariş hazırlanmayı bekliyor.",
        time: "10 dakika önce",
        unread: true,
        link: "/orders/ORD-01053",
    },

    {
        id: 3,
        type: "user",
        title: "Yeni Kullanıcı",
        message: "Ahmet Yılmaz sisteme kayıt oldu.",
        description:
            "Yeni müşteri hesabı oluşturuldu. E-posta doğrulaması başarıyla tamamlandı ve kullanıcı alışveriş yapmaya hazır.",
        time: "35 dakika önce",
        unread: false,
        link: "/users",
    },

    {
        id: 4,
        type: "system",
        title: "SMTP Bağlantısı",
        message: "Mail servisi yeniden bağlandı.",
        description:
            "SMTP bağlantısı tekrar aktif hale getirildi. Bundan sonra sipariş ve kullanıcı bildirimleri normal şekilde gönderilecektir.",
        time: "1 saat önce",
        unread: false,
        link: "/settings",
    },
];

const ICONS = {
    stock: Package,
    order: ShoppingCart,
    user: UserPlus,
    system: Settings,
};

export default function NotificationsPage() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState(notificationsData);

    const [activeTab, setActiveTab] = useState("all");

    const [selectedNotification, setSelectedNotification] =
        useState(notificationsData[0]);

    const filteredNotifications =
        activeTab === "all"
            ? notifications
            : notifications.filter((item) => item.type === activeTab);

    const unreadCount = notifications.filter(
        (item) => item.unread
    ).length;

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((item) => ({
                ...item,
                unread: false,
            }))
        );
    };

    return (
        <div className="space-y-6">

            {/* Sayfa Başlığı */}
            <div className="page-header">

                <div>
                    <h1 className="page-title">
                        Bildirim Merkezi
                    </h1>

                    <p className="page-subtitle">
                        Sistem uyarıları, siparişler, kullanıcı kayıtları ve mağaza bildirimlerini tek ekrandan yönetin.
                    </p>
                </div>

                <div className="flex items-center gap-3">

                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold">
                        {unreadCount} Okunmamış
                    </span>

                    <button
                        onClick={markAllAsRead}
                        className="btn btn-secondary"
                    >
                        Tümünü Okundu İşaretle
                    </button>

                </div>

            </div>

            {/* Filtreler */}
            <div className="flex flex-wrap gap-3">

                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-xl font-medium transition ${activeTab === "all"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                >
                    🔔 Tümü
                </button>

                <button
                    onClick={() => setActiveTab("stock")}
                    className={`px-4 py-2 rounded-xl font-medium transition ${activeTab === "stock"
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                >
                    🚨 Kritik Stok
                </button>

                <button
                    onClick={() => setActiveTab("order")}
                    className={`px-4 py-2 rounded-xl font-medium transition ${activeTab === "order"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                >
                    📦 Yeni Sipariş
                </button>

                <button
                    onClick={() => setActiveTab("user")}
                    className={`px-4 py-2 rounded-xl font-medium transition ${activeTab === "user"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                >
                    👤 Yeni Kayıt
                </button>

                <button
                    onClick={() => setActiveTab("system")}
                    className={`px-4 py-2 rounded-xl font-medium transition ${activeTab === "system"
                        ? "bg-slate-700 text-white shadow-md"
                        : "bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                >
                    ⚙ Sistem
                </button>

            </div>

            {/* Ana Alan */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Sol Panel - Bildirim Listesi */}
                <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-indigo-600" />
                            <h2 className="font-semibold text-slate-800">
                                Bildirimler
                            </h2>
                        </div>

                        <span className="text-xs text-slate-500">
                            {filteredNotifications.length} kayıt
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">

                        {filteredNotifications.length === 0 && (
                            <div className="py-14 text-center">
                                <Bell size={40} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-sm text-slate-500">
                                    Bu kategoride bildirim bulunmuyor.
                                </p>
                            </div>
                        )}

                        {filteredNotifications.map((notification) => {

                            const Icon = ICONS[notification.type];

                            return (

                                <div
                                    key={notification.id}
                                    onClick={() => {

                                        setSelectedNotification(notification);

                                        if (notification.unread) {

                                            setNotifications(prev =>
                                                prev.map(item =>
                                                    item.id === notification.id
                                                        ? { ...item, unread: false }
                                                        : item
                                                )
                                            );

                                        }

                                    }}
                                    className={`cursor-pointer px-5 py-4 transition

                                        ${selectedNotification?.id === notification.id
                                            ? "bg-indigo-50 border-r-4 border-indigo-600"
                                            : "hover:bg-slate-50"
                                        }

                                    `}
                                >

                                    <div className="flex gap-3">

                                        <div
                                            className={`
                                                w-11 h-11 rounded-xl flex items-center justify-center

                                                ${notification.type === "stock"
                                                    ? "bg-red-100"
                                                    : notification.type === "order"
                                                        ? "bg-blue-100"
                                                        : notification.type === "user"
                                                            ? "bg-green-100"
                                                            : "bg-slate-100"
                                                }
                                            `}
                                        >

                                            <Icon
                                                size={18}
                                                className={`
                                                    ${notification.type === "stock"
                                                        ? "text-red-600"
                                                        : notification.type === "order"
                                                            ? "text-blue-600"
                                                            : notification.type === "user"
                                                                ? "text-green-600"
                                                                : "text-slate-600"
                                                    }
                                                `}
                                            />

                                        </div>

                                        <div className="flex-1">

                                            <div className="flex justify-between">

                                                <h3 className="font-semibold text-sm text-slate-800">
                                                    {notification.title}
                                                </h3>

                                                {notification.unread && (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1" />
                                                )}

                                            </div>

                                            <p className="text-sm text-slate-500 mt-1">
                                                {notification.message}
                                            </p>

                                            <p className="text-xs text-slate-400 mt-2">
                                                {notification.time}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                </div>

                {/* Sağ Panel - Bildirim Detayı */}
                <div className="xl:col-span-2">

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full">

                        {selectedNotification ? (

                            <>

                                <div className="px-8 py-6 border-b border-slate-100">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <h2 className="text-2xl font-bold text-slate-800">
                                                {selectedNotification.title}
                                            </h2>

                                            <p className="text-sm text-slate-500 mt-2">
                                                {selectedNotification.time}
                                            </p>

                                        </div>

                                        {selectedNotification.unread && (
                                            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                                Yeni
                                            </span>
                                        )}

                                    </div>

                                </div>

                                <div className="p-8 space-y-8">

                                    <div>

                                        <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                            Bildirim Özeti
                                        </h3>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                                            <p className="text-slate-700 leading-7">
                                                {selectedNotification.description}
                                            </p>

                                        </div>

                                    </div>

                                    <div>

                                        <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                            İşlem Bilgisi
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4">

                                            <div className="rounded-xl border border-slate-200 p-4">

                                                <p className="text-xs text-slate-400">
                                                    Bildirim Türü
                                                </p>

                                                <p className="font-semibold mt-1 capitalize">
                                                    {selectedNotification.type}
                                                </p>

                                            </div>

                                            <div className="rounded-xl border border-slate-200 p-4">

                                                <p className="text-xs text-slate-400">
                                                    Oluşturulma
                                                </p>

                                                <p className="font-semibold mt-1">
                                                    {selectedNotification.time}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="flex gap-3 pt-4">

                                        <button
                                            onClick={() => navigate(selectedNotification.link)}
                                            className="btn btn-primary"
                                        >
                                            İlgili Sayfaya Git
                                        </button>

                                        <button
                                            onClick={() => {
                                                const updated = notifications.filter(
                                                    item => item.id !== selectedNotification.id
                                                );

                                                setNotifications(updated);

                                                if (updated.length > 0) {
                                                    setSelectedNotification(updated[0]);
                                                } else {
                                                    setSelectedNotification(null);
                                                }
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            Bildirimi Kaldır
                                        </button>

                                    </div>

                                </div>

                            </>

                        ) : (

                            <div className="flex flex-col items-center justify-center h-[600px] text-center">

                                <Bell
                                    size={60}
                                    className="text-slate-300 mb-5"
                                />

                                <h2 className="text-xl font-bold text-slate-700">
                                    Bildirim Seçilmedi
                                </h2>

                                <p className="text-slate-500 mt-2">
                                    Soldaki listeden bir bildirim seçerek detaylarını görüntüleyebilirsiniz.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>
    )
}