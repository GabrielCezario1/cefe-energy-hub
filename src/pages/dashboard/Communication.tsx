import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Mail, Phone, ExternalLink, Plus, Pencil, Trash2 } from "lucide-react";

interface Stakeholder {
  id: number;
  name: string;
  role: string;
  contact: string;
  phone: string;
}

const initialStakeholders: Stakeholder[] = [
  { id: 1, name: "Deif", role: "Fornecedor de Inversores", contact: "contato@deif.com", phone: "+55 11 3456-7890" },
  { id: 2, name: "Ynova", role: "Integrador", contact: "suporte@ynova.com.br", phone: "+55 21 98765-4321" },
  { id: 3, name: "Sungrow", role: "Fabricante de Equipamentos", contact: "brasil@sungrow.com", phone: "+55 11 2345-6789" },
  { id: 4, name: "Fortlev Solar", role: "Estruturas", contact: "comercial@fortlevsolar.com.br", phone: "+55 48 3333-4444" },
  { id: 5, name: "Gabriel - TI", role: "Empresa de TI", contact: "gabriel@empresa.com", phone: "+55 21 99999-8888" },
  { id: 6, name: "Enel Ceará", role: "Concessionária - CE", contact: "atendimento@enel.com.br", phone: "0800 123 4567" },
  { id: 7, name: "EDP Espírito Santo", role: "Concessionária - ES", contact: "contato@edp.com.br", phone: "0800 765 4321" },
  { id: 8, name: "Light Rio", role: "Concessionária - RJ", contact: "suporte@light.com.br", phone: "0800 999 8888" },
];

const emptyForm = { name: "", role: "", contact: "", phone: "" };

const Communication = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(initialStakeholders);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  const validate = () => {
    const next: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) next.name = "Nome é obrigatório.";
    if (!form.role.trim()) next.role = "Função é obrigatória.";
    if (!form.contact.trim()) next.contact = "E-mail é obrigatório.";
    if (!form.phone.trim()) next.phone = "Telefone é obrigatório.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (stakeholder: Stakeholder) => {
    setEditingId(stakeholder.id);
    setForm({ name: stakeholder.name, role: stakeholder.role, contact: stakeholder.contact, phone: stakeholder.phone });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId !== null) {
      setStakeholders((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...form } : s))
      );
    } else {
      const newId = Date.now();
      setStakeholders((prev) => [...prev, { id: newId, ...form }]);
    }
    setDialogOpen(false);
  };

  const openDelete = (id: number) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pendingDeleteId !== null) {
      setStakeholders((prev) => prev.filter((s) => s.id !== pendingDeleteId));
    }
    setDeleteDialogOpen(false);
    setPendingDeleteId(null);
  };

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Comunicação e Gerência de Parcerias</h1>
          <p className="text-muted-foreground">Centralização de informações dos stakeholders</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Contato
        </Button>
      </div>

      {/* Stakeholders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stakeholders.map((stakeholder) => (
          <Card key={stakeholder.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => openEdit(stakeholder)}
                    title="Editar contato"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => openDelete(stakeholder.id)}
                    title="Remover contato"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Badge variant="outline" className="w-fit mt-1">
                {stakeholder.role}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${stakeholder.contact}`} className="hover:text-primary truncate">
                  {stakeholder.contact}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{stakeholder.phone}</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Editar Contato" : "Novo Contato"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Empresa Solar Ltda"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="role">Função / Papel</Label>
              <Input
                id="role"
                placeholder="Ex: Fornecedor de Inversores"
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
              />
              {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contact">E-mail</Label>
              <Input
                id="contact"
                type="email"
                placeholder="Ex: contato@empresa.com"
                value={form.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
              />
              {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="Ex: +55 11 98765-4321"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSave}>
              {editingId !== null ? "Salvar Alterações" : "Adicionar Contato"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover contato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este contato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Communication;
