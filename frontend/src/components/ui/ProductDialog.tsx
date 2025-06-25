"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { toast } from "sonner";

// Schema de validação com Zod
const formSchema = z.object({
  name: z.string().min(3, "Nome precisa de no mínimo 3 caracteres.").max(100),
  description: z.string().max(300).optional(),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo."),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que R$0,01."),
});

interface ProductDialogProps {
  onProductAdded: () => void; // Função para recarregar a lista de produtos
}

export function ProductDialog({ onProductAdded }: ProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", stock: 0, price: 0.01 },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await api.post('/products', values);
      toast.success("Produto adicionado com sucesso.");
      onProductAdded(); // Avisa o componente pai para recarregar os dados
      setIsOpen(false); // Fecha o modal
      form.reset(); // Limpa o formulário
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erro desconhecido";
     toast.error("Erro ao adicionar produto", {
      description: `Ocorreu um erro: ${errorMessage}`,
    });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Produto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo produto.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl><Input placeholder="Café Especial" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* Repita FormField para description, stock e price */}
            <FormField name="stock" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="price" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar Produto"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}