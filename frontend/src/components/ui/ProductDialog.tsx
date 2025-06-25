"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { toast } from "sonner";
import axios from "axios";
import { Product } from "@/types";

const formSchema = z.object({
  name: z.string().min(3, "Nome precisa de no mínimo 3 caracteres.").max(100),
  description: z.string().max(300).optional(),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo."),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que R$0,01."),
});

interface ProductDialogProps {
  onActionComplete: () => void;
  productToEdit?: Product;
  triggerButton: React.ReactNode;
}

export function ProductDialog({ onActionComplete, productToEdit, triggerButton }: ProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = !!productToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", stock: 0, price: 0.01 },
  });

  useEffect(() => {
    if (productToEdit) {
      // AQUI ESTÁ A CORREÇÃO: Transformamos o objeto para garantir compatibilidade
      const formValues = {
        ...productToEdit,
        description: productToEdit.description || "", // Converte null para string vazia
      };
      form.reset(formValues);
    } else {
      form.reset({ name: "", description: "", stock: 0, price: 0.01 });
    }
  }, [productToEdit, form, isOpen]); // Adicionei 'isOpen' para resetar o form ao reabrir

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const action = isEditMode ? 'atualizar' : 'adicionar';
    try {
      if (isEditMode) {
        await api.patch(`/products/${productToEdit.id}`, values);
      } else {
        await api.post('/products', values);
      }
      toast.success(`Produto ${action}d com sucesso.`);
      onActionComplete();
      setIsOpen(false);
    } catch (error) {
      let errorMessage = `Erro desconhecido ao ${action} produto.`;
      if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data.message;
      }
      toast.error(`Falha ao ${action} produto`, {
        description: errorMessage,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere as informações do produto." : "Preencha as informações do novo produto."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => ( <FormItem> <FormLabel>Nome</FormLabel> <FormControl><Input placeholder="Café Especial" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField name="description" control={form.control} render={({ field }) => ( <FormItem> <FormLabel>Descrição</FormLabel> <FormControl><Input placeholder="Opcional" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField name="stock" control={form.control} render={({ field }) => ( <FormItem> <FormLabel>Estoque</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField name="price" control={form.control} render={({ field }) => ( <FormItem> <FormLabel>Preço (R$)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}