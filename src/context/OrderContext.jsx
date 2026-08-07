import { createContext, useState } from "react";

export const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [pendingOrders, setPendingOrders] = useState([
    {
      id: "ORD-1001",
      customer: "Ahmet Yılmaz",
      product: "Nike Air Max",
      quantity: 2,
      status: "Bekliyor",
      createdAt: new Date(),
      orderedAt: new Date(),
      updatedAt: new Date(),
      total: 299.99,
      items: [
        {
          product: "Nike Air Max",
          quantity: 2,
          unitPrice: 149.99,
          total: 299.98,
        },
      ],
      shippingCompany: "Yurtiçi Kargo",
      trackingNo: null,
    },
  ]);

  const [preparingOrders, setPreparingOrders] = useState([]);
  const [shippingOrders, setShippingOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);

  const approveOrder = (id) => {
    const order = pendingOrders.find((item) => item.id === id);
    if (!order) return;

    setPreparingOrders((prev) => [
      ...prev,
      {
        ...order,
        status: "Hazırlanıyor",
        updatedAt: new Date(),
      },
    ]);

    setPendingOrders((prev) => prev.filter((item) => item.id !== id));
  };

  const sendToCargo = (id) => {
    const order = preparingOrders.find((item) => item.id === id);
    if (!order) return;

    setPreparingOrders((prev) => prev.filter((item) => item.id !== id));
    setShippingOrders((prev) => [
      ...prev,
      {
        ...order,
        status: "Kargoda",
        updatedAt: new Date(),
      },
    ]);
  };

  const deliverOrder = (id) => {
    const order = shippingOrders.find((item) => item.id === id);
    if (!order) return;

    setShippingOrders((prev) => prev.filter((item) => item.id !== id));
    setDeliveredOrders((prev) => [
      ...prev,
      {
        ...order,
        status: "Teslim Edildi",
        updatedAt: new Date(),
      },
    ]);
  };

  return (
    <OrderContext.Provider
      value={{
        pendingOrders,
        setPendingOrders,
        preparingOrders,
        setPreparingOrders,
        shippingOrders,
        setShippingOrders,
        deliveredOrders,
        setDeliveredOrders,
        approveOrder,
        sendToCargo,
        deliverOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
