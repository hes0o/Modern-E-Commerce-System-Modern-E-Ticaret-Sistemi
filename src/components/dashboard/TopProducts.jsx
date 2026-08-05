import { topProducts } from "@/mock/topProducts";
import { Package } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

export default function TopProducts() {
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