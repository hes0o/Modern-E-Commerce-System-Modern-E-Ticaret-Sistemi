import { useState } from "react";
import Barcode from "react-barcode";
import {
    CircleCheckBig,
    Clock,
    User,
    Package,
    Eye,
    X,
    AlertTriangle
} from "lucide-react";


const initialOrders = [
    {
        id: "ORD-1001",
        customer: "Ahmet Yılmaz",
        phone: "0555 555 55 55",
        email: "ahmet@gmail.com",

        product: "Nike Air Max",
        quantity: 2,

        address:
            "Mustafa Kemal Mah. 123. Sokak No:5 İstanbul",

        invoiceAddress:
            "Mustafa Kemal Mah. 123. Sokak No:5 İstanbul",

        payment:
            "Kredi Kartı",

        total:
            "3.499 TL",

        createdAt: new Date(Date.now() - 1000 * 60 * 90),
    },
];


function getWaitingTime(date) {

    const diff =
        Math.floor((Date.now() - date.getTime()) / 1000 / 60);


    if (diff < 30) {
        return {
            text: `${diff} dakika`,
            color: "bg-green-100 text-green-700",
            icon: "green"
        };
    }


    if (diff < 120) {
        return {
            text: `${diff} dakika`,
            color: "bg-yellow-100 text-yellow-700",
            icon: "yellow"
        };
    }


    return {
        text: `${diff} dakika`,
        color: "bg-red-100 text-red-700",
        icon: "red"
    };

}


export default function PendingOrdersPage() {


    const [orders, setOrders] = useState(initialOrders);
    const [selectedOrder, setSelectedOrder] = useState(null);



    const approveOrder = (id) => {

        setOrders(prev =>
            prev.filter(order => order.id !== id)
        );

        // Backend bağlanınca:
        // status = preparing yapılacak
    };



    const cancelOrder = (id) => {

        setOrders(prev =>
            prev.filter(order => order.id !== id)
        );

        // Backend bağlanınca:
        // status = cancelled yapılacak
    };



    return (

        <div className="space-y-6">


            {/* Header */}

            <div>

                <h1 className="text-2xl font-bold text-slate-800">
                    Onay Bekleyen Siparişler
                </h1>

            </div>
            {/* Liste */}


            <div className="
                    bg-white
                    rounded-2xl
                    w-full
                    max-w-3xl
                    shadow-xl
                    overflow-hidden
                ">
                {orders.length === 0 && (

                    <div className="py-20 text-center">


                        <Package
                            size={50}
                            className="mx-auto text-slate-300"
                        />


                        <h3 className="mt-4 font-semibold text-slate-700">
                            Bekleyen sipariş yok
                        </h3>


                        <p className="text-sm text-slate-500 mt-2">
                            Yeni sipariş geldiğinde burada görünecek.
                        </p>


                    </div>

                )}




                <div className="divide-y divide-slate-100">


                    {orders.map(order => {


                        const waiting =
                            getWaitingTime(order.createdAt);



                        return (

                            <div
                                key={order.id}
                                className="
                                p-6
                                hover:bg-slate-50
                                transition
                                "
                            >


                                <div className="flex justify-between gap-5">


                                    {/* Sol bilgi */}

                                    <div className="space-y-3">


                                        <div className="flex items-center gap-3">


                                            <div
                                                className="
                                                w-11
                                                h-11
                                                rounded-xl
                                                bg-indigo-100
                                                flex
                                                items-center
                                                justify-center
                                                "
                                            >

                                                <Package
                                                    size={22}
                                                    className="text-indigo-600"
                                                />

                                            </div>



                                            <div>

                                                <h2 className="font-bold text-slate-800">
                                                    {order.id}
                                                </h2>

                                                <p className="text-sm text-slate-500">
                                                    {order.product}
                                                </p>

                                            </div>


                                        </div>




                                        <div className="flex gap-5 text-sm text-slate-600">


                                            <span className="flex items-center gap-2">

                                                <User size={15} />

                                                {order.customer}

                                            </span>



                                            <span>

                                                Adet:
                                                {" "}
                                                {order.quantity}

                                            </span>


                                        </div>



                                    </div>






                                    {/* Sağ taraf */}


                                    <div className="flex flex-col items-end gap-4">


                                        <div
                                            className={`
                                            px-3 py-2 
                                            rounded-xl
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            font-semibold
                                            ${waiting.color}
                                            `}
                                        >

                                            {waiting.icon === "red"
                                                ?
                                                <AlertTriangle size={16} />
                                                :
                                                <Clock size={16} />
                                            }


                                            {waiting.text}
                                            {" "}
                                            bekliyor

                                        </div>




                                        <div className="flex gap-2">


                                            <button

                                                onClick={() =>
                                                    setSelectedOrder(order)
                                                }

                                                className="
                                                flex
                                                items-center
                                                gap-2
                                                px-4
                                                py-2
                                                rounded-xl
                                                bg-slate-100
                                                text-slate-700
                                                text-sm
                                                hover:bg-slate-200
                                                "

                                            >

                                                <Eye size={16} />

                                                Detay

                                            </button>



                                            <button

                                                onClick={() =>
                                                    approveOrder(order.id)
                                                }

                                                className="
                                                flex
                                                items-center
                                                gap-2
                                                px-4
                                                py-2
                                                rounded-xl
                                                bg-green-600
                                                text-white
                                                text-sm
                                                hover:bg-green-700
                                                "

                                            >

                                                <CircleCheckBig size={16} />

                                                Onayla

                                            </button>



                                            <button

                                                onClick={() =>
                                                    cancelOrder(order.id)
                                                }

                                                className="
                                                px-4
                                                py-2
                                                rounded-xl
                                                bg-red-100
                                                text-red-600
                                                text-sm
                                                hover:bg-red-200
                                                "

                                            >

                                                İptal

                                            </button>


                                        </div>


                                    </div>


                                </div>



                            </div>


                        );


                    })}


                </div>


            </div>

            {/* Sipariş Detay Modal */}

            {selectedOrder && (

                <div className="
            fixed
            inset-0
            bg-black/40
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
            p-5
        ">


                    <div className="
                            bg-white
                            rounded-2xl
                            w-full
                            max-w-3xl
                            max-h-[90vh]
                            shadow-xl
                            overflow-hidden
                            flex
                            flex-col
                        ">


                        {/* Modal Header */}

                        <div className="
                            px-6
                            py-5
                            border-b
                            border-slate-200
                            flex
                            justify-between
                            items-center
                            flex-shrink-0
                        ">

                            <div>

                                <h2 className="
                            text-xl
                            font-bold
                            text-slate-800
                        ">
                                    Sipariş Detayı
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    {selectedOrder.id}
                                </p>

                            </div>


                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="
                            p-2
                            rounded-lg
                            hover:bg-slate-100
                        "
                            >

                                <X size={20} />

                            </button>


                        </div>



                        {/* İçerik */}

                        <div className="
                            p-6
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-5
                            overflow-y-auto
                            flex-1
                        ">


                            <div className="
                        border
                        rounded-xl
                        p-4
                    ">

                                <h3 className="font-semibold text-slate-700 mb-3">
                                    Müşteri Bilgileri
                                </h3>

                                <p>
                                    <b>Ad:</b> {selectedOrder.customer}
                                </p>

                                <p>
                                    <b>Telefon:</b> {selectedOrder.phone}
                                </p>

                                <p>
                                    <b>Email:</b> {selectedOrder.email}
                                </p>


                            </div>



                            <div className="
                        border
                        rounded-xl
                        p-4
                    ">

                                <h3 className="font-semibold text-slate-700 mb-3">
                                    Ürün Bilgileri
                                </h3>

                                <p>
                                    <b>Ürün:</b> {selectedOrder.product}
                                </p>

                                <p>
                                    <b>Adet:</b> {selectedOrder.quantity}
                                </p>


                                <p>
                                    <b>Tutar:</b> {selectedOrder.total}
                                </p>


                            </div>




                            <div className="
                        border
                        rounded-xl
                        p-4
                        md:col-span-2
                    ">

                                <h3 className="font-semibold text-slate-700 mb-3">
                                    Teslimat Adresi
                                </h3>

                                <p>
                                    {selectedOrder.address}
                                </p>


                            </div>



                            <div className="
                        border
                        rounded-xl
                        p-4
                        md:col-span-2
                    ">

                                <h3 className="font-semibold text-slate-700 mb-3">
                                    Fatura Bilgileri
                                </h3>

                                <p>
                                    {selectedOrder.invoiceAddress}
                                </p>

                                <p className="mt-2">
                                    <b>Ödeme:</b> {selectedOrder.payment}
                                </p>


                            </div>



                        </div>
                        <div
                            className="
                                border
                                rounded-xl
                                p-5
                                md:col-span-2
                                bg-slate-50
                                mt-4
                            "
                        >


                            <h3 className="
                        font-semibold
                        text-slate-700
                        mb-4
                        ">

                                Kargo Etiketi Önizleme

                            </h3>



                            <div
                                id="cargo-label"
                                className="
                                bg-white
                                border
                                rounded-xl
                                p-4
                                w-full
                                max-w-sm
                            "
                            >


                                <div className="text-center mb-4">

                                    <Barcode
                                        value={selectedOrder.id}
                                        width={1.5}
                                        height={50}
                                    />

                                </div>



                                <div className="space-y-2 text-sm">


                                    <p>
                                        <b>Sipariş No:</b>
                                        {selectedOrder.id}
                                    </p>


                                    <p>
                                        <b>Alıcı:</b>
                                        {selectedOrder.customer}
                                    </p>


                                    <p>
                                        <b>Telefon:</b>
                                        {selectedOrder.phone}
                                    </p>



                                    <p>
                                        <b>Adres:</b>
                                        <br />

                                        {selectedOrder.address}

                                    </p>



                                    <p>
                                        <b>Ürün:</b>
                                        {selectedOrder.product}
                                    </p>



                                    <p>
                                        <b>Adet:</b>
                                        {selectedOrder.quantity}
                                    </p>



                                    <p>
                                        <b>Ödeme:</b>
                                        {selectedOrder.payment}
                                    </p>


                                    <p>
                                        <b>Tutar:</b>
                                        {selectedOrder.total}
                                    </p>



                                </div>


                            </div>


                        </div>
                        <button

                            onClick={() => window.print()}

                            className="
                            px-5
                            py-2
                            rounded-xl
                            bg-indigo-600
                            text-white
                            hover:bg-indigo-700
                            "

                        >

                            🖨 Kargo Etiketi Yazdır

                        </button>



                        <div className="
                            px-6
                            py-4
                            border-t
                            flex
                            justify-end
                            flex-shrink-0
                        ">

                            <button

                                onClick={() => setSelectedOrder(null)}

                                className="
                            px-5
                            py-2
                            rounded-xl
                            bg-slate-800
                            text-white
                            hover:bg-slate-900
                        "

                            >

                                Kapat

                            </button>


                        </div>



                    </div>


                </div>

            )}
        </div>

    );

}