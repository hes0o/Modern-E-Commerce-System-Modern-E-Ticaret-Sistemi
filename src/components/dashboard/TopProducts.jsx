import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import api from "@/services/api";

export default function TopProducts() {
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        api.get("/api/products", { params: { page: 1, page_size: 5 } })
            .then((res) => {
                const items = res.data.data?.items || [];
                setTopProducts(
                    items.map((p) => ({
                        id: p.id,
                        name: p.name,
                        sales: p.total_sold || 0,
                        revenue: (p.total_sold || 0) * (p.price || 0),
                        stock: p.stock || 0,
                    }))
                );
            })
            .catch(() => {});
    }, []);

    return (
        <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold">En Çok Satan Ürünler</h3>
                    <p className="text-xs text-slate-500">
                        En fazla satış yapan ilk 5 ürün
                    </p>
                </div>

                <Package className="text-indigo-600" size={22} />
            </div>

            <div className="space-y-3">
                {topProducts.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">Henüz veri yok</p>
                )}
                {topProducts.map((product, index) => (
                    <div
                        key={product.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                        <div>
                            <p className="font-semibold">
                                #{index + 1} {product.name}
                            </p>

                            <p className="text-xs text-slate-500">
                                {product.sales} satış
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="font-bold">
                                {formatCurrency(product.revenue)}
                            </p>

                            <p className="text-xs text-slate-500">
                                Stok: {product.stock}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}