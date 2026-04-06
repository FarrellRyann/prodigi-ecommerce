import { api } from '@/lib/axios';
import { Product, Category, ProductFilters } from '@/types/product';

export const ProductService = {
  async getAll(filters?: ProductFilters): Promise<Product[]> {
    // Current backend lacks native filtering support, so we will handle it 
    // on the client for now (as per blueprint strategy).
    const { data } = await api.get<Product[]>('/products');
    
    let filtered = [...data];
    if (filters?.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  async create(payload: Partial<Product>): Promise<Product> {
    const { data } = await api.post<Product>('/products', payload);
    return data;
  },

  async update(id: string, payload: Partial<Product>): Promise<Product> {
    const { data } = await api.put<Product>(`/products/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};
