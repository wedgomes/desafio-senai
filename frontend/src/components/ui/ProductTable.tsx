import { Product } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductDialog } from "./ProductDialog"; // Importe o Dialog de Produto
import { ApplyCouponDialog } from "./ApplyCouponDialog"; // Importe o Dialog de Cupom
import { api } from "@/services/api";
import { toast } from "sonner";

interface ProductTableProps {
  products: Product[];
  onActionComplete: () => void; // Prop para notificar o pai para recarregar
}

export function ProductTable({ products, onActionComplete }: ProductTableProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

   const handleRemoveDiscount = async (productId: number) => {
    try {
      await api.delete(`/products/${productId}/discount`);
      toast.success("Desconto removido com sucesso!");
      onActionComplete(); // Chama a função do componente pai para recarregar a lista
    } catch (error: any) {
      toast.error("Falha ao remover desconto.");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Preço Original</TableHead>
            <TableHead>Preço Final</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  {product.name}
                  {product.is_out_of_stock && (
                    <Badge variant="destructive" className="ml-2">Esgotado</Badge>
                  )}
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className={product.hasCouponApplied ? 'line-through text-muted-foreground' : ''}>
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(product.finalPrice)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <ProductDialog
                      onActionComplete={onActionComplete}
                      productToEdit={product}
                      triggerButton={<Button variant="outline" size="sm">Editar</Button>}
                    />
                    {product.hasCouponApplied ? (
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveDiscount(product.id)}>
                        Remover Desconto
                      </Button>
                    ) : (
                      <ApplyCouponDialog
                        productId={product.id}
                        onActionComplete={onActionComplete}
                      />
                    )}
                  </div>
                  {/* TODO: Adicionar outras ações */}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}