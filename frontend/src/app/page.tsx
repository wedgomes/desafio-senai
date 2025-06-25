"use client"; // Precisamos de interatividade (estado), então marcamos como Client Component

import { useEffect, useState } from "react";
import { ProductTable } from "@/components/ui/ProductTable";
import { PaginatedProductsResponse, Product, PaginationMeta } from "@/types";
import { api } from "@/services/api";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);
        // Por enquanto, buscamos a primeira página sem filtros
        const response = await api.get<PaginatedProductsResponse>('/products');
        setProducts(response.data.data);
        setMeta(response.data.meta);
      } catch (err) {
        console.error(err);
        setError("Falha ao buscar produtos. O backend está rodando?");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []); // O array vazio faz com que o useEffect rode apenas uma vez

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Produtos</h1>

      {/* Área para filtros (será implementada depois) */}
      <div className="mb-4">
        {/* TODO: Adicionar filtros */}
      </div>

      {isLoading && <p>Carregando produtos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && (
        <>
          <ProductTable products={products} />
          {/* Área para paginação (será implementada depois) */}
          <div className="mt-4">
            {/* TODO: Adicionar paginação */}
          </div>
        </>
      )}
    </main>
  );
}