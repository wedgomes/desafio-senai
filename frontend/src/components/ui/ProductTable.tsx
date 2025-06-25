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

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
                  <Button variant="outline" size="sm">Editar</Button>
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