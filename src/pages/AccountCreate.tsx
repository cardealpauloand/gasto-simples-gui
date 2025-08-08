import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, User } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { accountsService, type AccountGroup } from "@/services/accounts";

const AccountCreate = () => {
  const [name, setName] = useState("");
  const [initialValue, setInitialValue] = useState("0");
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [groupId, setGroupId] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    accountsService
      .getAccountGroups()
      .then(setGroups)
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido";
        toast({
          title: "Erro ao carregar grupos",
          description: message,
          variant: "destructive",
        });
      });
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await accountsService.createAccount({
        name,
        initialValue: Number(initialValue),
        accountGroupId: groupId || undefined,
      });
      toast({
        title: "Conta criada",
        description: `${name} foi adicionada com sucesso.`,
      });
      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao criar conta",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <Menu className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-xl font-bold text-foreground">
                Cadastrar Conta
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Paulo André
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-card p-6 rounded-lg shadow space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nome da conta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Grupo</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger id="group">
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialValue">Saldo inicial</Label>
            <Input
              id="initialValue"
              type="number"
              value={initialValue}
              onChange={(e) => setInitialValue(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Salvar
          </Button>
        </form>
      </main>
    </div>
  );
};

export default AccountCreate;
