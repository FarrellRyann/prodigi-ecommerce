import { api } from '@/lib/axios';

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  totalPrice: number;
  paymentUrl: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    imageUrl: string | null;
    downloadUrl: string | null;
  };
  quantity: number;
  price: number;
}

export const OrderService = {
  async getById(id: string): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  async getHistory(): Promise<Order[]> {
    const { data } = await api.get<{ data: Order[] }>('/orders');
    return data.data;
  }
};
