import { useEffect, useState } from "react";
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
import { accountsService, type AccountGroup } from "@/services/accounts";
import { useToast } from "@/hooks/use-toast";

interface AccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    initialValue: number;
    accountGroupId?: string;
  }) => void;
}

interface FormState {
  name: string;
  initialValue: string;
  groupId: string;
}

export function AccountDialog({
  isOpen,
  onOpenChange,
  onSubmit,
}: AccountDialogProps) {
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState>({
    name: "",
    initialValue: "0",
    groupId: "",
  });
  const [groups, setGroups] = useState<AccountGroup[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    setFormState({ name: "", initialValue: "0", groupId: "" });

    accountsService
      .getAccountGroups()
      .then(setGroups)
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido";
        toast({
          title: "Erro ao carregar grupos",
          description: message,
          variant: "destructive",
        });
      });
  }, [isOpen, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formState.name,
      initialValue: Number(formState.initialValue),
      accountGroupId: formState.groupId || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova Conta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da conta</Label>
            <Input
              id="name"
              value={formState.name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Grupo</Label>
            <Select
              value={formState.groupId}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, groupId: value }))
              }
            >
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
              value={formState.initialValue}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  initialValue: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AccountDialog;

