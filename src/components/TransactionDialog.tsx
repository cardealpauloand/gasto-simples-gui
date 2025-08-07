import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAccounts } from "@/contexts/AccountsContext";

interface TransactionFormData {
  description: string;
  accountId: string;
  accountOutId?: string;
  date: string;
  value: string;
  categories: string[];
  tags: string[];
}

interface TransactionDialogProps {
  type: "income" | "expense" | "transfer";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData & { type: string }) => void;
}

const mockCategories = [
  "Comida",
  "Lazer",
  "Transporte",
  "Saúde",
  "Educação",
  "Casa",
  "Outros",
];

const mockTags = ["Saúde", "Comida", "Trabalho", "Familia", "Investimento"];

export function TransactionDialog({
  type,
  isOpen,
  onOpenChange,
  onSubmit,
}: TransactionDialogProps) {
  const accounts = useAccounts();

  const [formData, setFormData] = useState<TransactionFormData>({
    description: "",
    accountId: "",
    accountOutId: "",
    date: new Date().toISOString().split("T")[0],
    value: "",
    categories: [],
    tags: [],
  });

  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", { ...formData, type });

    onSubmit({ ...formData, type });
    // Reset form
    setFormData({
      description: "",
      accountId: "",
      accountOutId: "",
      date: new Date().toISOString().split("T")[0],
      value: "",
      categories: [],
      tags: [],
    });
    onOpenChange(false);
  };

  const addCategory = () => {
    if (newCategory && !formData.categories.includes(newCategory)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const getTypeInfo = () => {
    switch (type) {
      case "income":
        return { title: "Nova Receita", tabValue: "Entrada" };
      case "expense":
        return { title: "Nova Despesa", tabValue: "Saída" };
      case "transfer":
        return { title: "Nova Transferência", tabValue: "Transferência" };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{typeInfo.title}</DialogTitle>
        </DialogHeader>

        <Tabs value={typeInfo.tabValue} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="Entrada" className="text-sm">
              Entrada
            </TabsTrigger>
            <TabsTrigger value="Transferência" className="text-sm">
              Transferência
            </TabsTrigger>
            <TabsTrigger value="Saída" className="text-sm">
              Saída
            </TabsTrigger>
          </TabsList>

          <TabsContent value={typeInfo.tabValue} className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Ex: Hambúrguer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Banco */}
                <div className="space-y-2">
                  <Label htmlFor="account">Banco</Label>
                  <Select
                    value={formData.accountId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, accountId: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem
                          key={account.id}
                          value={account.id?.toString()}
                        >
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Banco de destino para transferência */}
              {type === "transfer" && (
                <div className="space-y-2">
                  <Label htmlFor="accountOut">Banco de Destino</Label>
                  <Select
                    value={formData.accountOutId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, accountOutId: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o banco de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem
                          key={account.id}
                          value={account.id?.toString()}
                        >
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Select value={newTag} onValueChange={setNewTag}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Adicionar tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={addTag}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Valor e Categorias */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Valor</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-input rounded-md">
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        placeholder="0,00"
                        className="border-0 focus-visible:ring-0"
                        required
                      />
                      <span className="px-3 py-2 text-sm text-muted-foreground border-l">
                        BRL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categorias */}
                <div className="space-y-2">
                  <Label>Categorias</Label>
                  <div className="flex gap-2">
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Adicionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={addCategory}
                      size="icon"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.categories.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {category}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeCategory(category)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {formData.value
                        ? `R$ ${parseFloat(formData.value).toFixed(2)}`
                        : "R$ 0,00"}
                    </span>
                    <span className="text-sm text-muted-foreground">BRL</span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant={
                    type === "income"
                      ? "income"
                      : type === "expense"
                      ? "expense"
                      : "transfer"
                  }
                  className="w-full"
                >
                  Salvar
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
