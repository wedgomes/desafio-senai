"use client";

import { useEffect, useState, useCallback } from "react";
import { ProductTable } from "@/components/ui/ProductTable";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { ProductDialog } from "@/components/ui/ProductDialog";
import { PaginatedProductsResponse, Product, PaginationMeta } from "@/types";
import { api } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasDiscount, setHasDiscount] = useState<string>('all');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      if (hasDiscount !== 'all') {
        params.append('hasDiscount', hasDiscount);
      }

      const response = await api.get<PaginatedProductsResponse>(`/products?${params.toString()}`);
      setProducts(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error(err);
      setError("Falha ao buscar produtos. O backend está rodando?");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearchTerm, hasDiscount]);

  useEffect(() => {
    setIsClient(true);
    fetchProducts();
  }, [fetchProducts]);

  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Produtos</h1>
        {isClient && <ProductDialog onActionComplete={fetchProducts} triggerButton={<Button>Adicionar Produto</Button>} />}
      </div>
      
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Buscar por nome..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={hasDiscount} onValueChange={setHasDiscount}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status de Desconto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Com Desconto</SelectItem>
            <SelectItem value="false">Sem Desconto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p>Carregando produtos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {isClient && !isLoading && !error && (
        <>
          <ProductTable products={products} onActionComplete={fetchProducts} />
          {meta && meta.totalPages > 1 && (
            <PaginationControls
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </>
      )}
      <Toaster />
    </main>
  );
}