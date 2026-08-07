import { X } from "lucide-react";

export default function OrderDetailModal({
    order,
    onClose
}) {

    if (!order) return null;


    return (

        <div
            className="
            fixed
            inset-0
            bg-black/40
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
            p-5
            "
        >

            <div
                className="
                bg-white
                rounded-2xl
                w-full
                max-w-3xl
                max-h-[90vh]
                overflow-y-auto
                shadow-xl
                "
            >


                <div
                    className="
                    flex
                    justify-between
                    items-center
                    px-6
                    py-5
                    border-b
                    "
                >

                    <div>

                        <h2 className="text-xl font-bold">
                            Sipariş Detayı
                        </h2>

                        <p className="text-sm text-slate-500">
                            {order.id}
                        </p>

                    </div>


                    <button
                        onClick={onClose}
                    >
                        <X />
                    </button>


                </div>



                <div
                    className="
                    p-6
                    space-y-5
                    "
                >


                    <div className="border rounded-xl p-4">

                        <h3 className="font-semibold mb-3">
                            Müşteri Bilgileri
                        </h3>


                        <p>
                            <b>Ad:</b> {order.customer}
                        </p>


                        <p>
                            <b>Telefon:</b> {order.phone}
                        </p>


                        <p>
                            <b>Email:</b> {order.email}
                        </p>

                    </div>




                    <div className="border rounded-xl p-4">

                        <h3 className="font-semibold mb-3">
                            Teslimat
                        </h3>


                        <p>
                            {order.address}
                        </p>

                    </div>




                    <div className="border rounded-xl p-4">


                        <h3 className="font-semibold mb-3">
                            Fatura
                        </h3>


                        <p>
                            {order.invoiceAddress}
                        </p>


                        <p className="mt-2">
                            <b>Ödeme:</b> {order.payment}
                        </p>


                    </div>




                    <div className="border rounded-xl p-4">


                        <h3 className="font-semibold mb-3">
                            Ürün
                        </h3>


                        <p>
                            {order.product}
                        </p>


                        <p>
                            Adet: {order.quantity}
                        </p>


                        <p>
                            Tutar: {order.total}
                        </p>


                    </div>


                </div>


            </div>


        </div>

    );

}