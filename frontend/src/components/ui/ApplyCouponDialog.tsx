"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { toast } from "sonner";

interface ApplyCouponDialogProps {
  productId: number;
  onActionComplete: () => void;
}

export function ApplyCouponDialog({ productId, onActionComplete }: ApplyCouponDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/products/${productId}/discount/coupon`, { code });
      toast.success("Cupom aplicado com sucesso!");
      onActionComplete();
      setIsOpen(false);
      setCode("");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erro desconhecido";
      toast.error("Falha ao aplicar cupom", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Aplicar Cupom</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aplicar Cupom Promocional</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="coupon-code" className="sr-only">Código do Cupom</Label>
            <Input
              id="coupon-code"
              placeholder="Ex: PROMO15"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Aplicando..." : "Aplicar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}