"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ChevronDown } from "lucide-react";
import { ChecklistTask } from "@/redux/slices/checklistSlice";
import {
  CHECKLIST_CATEGORY_OPTIONS,
  CHECKLIST_STATUS_OPTIONS,
  CHECKLIST_PRIORITY_OPTIONS,
  CHECKLIST_TIMELINE_OPTIONS,
} from "@/utils/constants";

interface ChecklistFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ChecklistTask | null;
  onSubmit: (data: Omit<ChecklistTask, "id" | "created_at">) => void;
  loading: boolean;
}

const getInitialFormData = (item: ChecklistTask | null | undefined) => {
  if (item) {
    return {
      title: item.title,
      description: item.description || "",
      category: item.category,
      timeline_phase: item.timeline_phase,
      due_date: item.due_date || "",
      status: item.status,
      priority: item.priority,
    };
  }
  return {
    title: "",
    description: "",
    category: "other",
    timeline_phase: "phase_1",
    due_date: "",
    status: "todo",
    priority: "medium",
  };
};

export function ChecklistFormModal({
  open,
  onOpenChange,
  item,
  onSubmit,
  loading,
}: ChecklistFormModalProps) {
  const [formData, setFormData] = useState(() => getInitialFormData(item));

  useEffect(() => {
    setFormData(getInitialFormData(item));
  }, [item]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData(getInitialFormData(item));
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] border-border shadow-2xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {item ? "Edit" : "Tambah"} Task
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {item ? "Update task checklist" : "Tambahkan task baru ke checklist"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-foreground"
              >
                Nama Task <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                placeholder="Masukkan nama task"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Deskripsi
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full min-h-20 px-3 py-2 text-sm bg-input border border-input rounded-md shadow-xs placeholder:text-muted-foreground outline-none transition-[color,box-shadow] resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                placeholder="Tambahkan deskripsi (opsional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-foreground"
                >
                  Kategori <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger
                    id="category"
                    className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                  >
                    <SelectValue placeholder="Pilih kategori" />
                    <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {CHECKLIST_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="timeline_phase"
                  className="text-sm font-medium text-foreground"
                >
                  Fase Timeline <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.timeline_phase}
                  onValueChange={(value) =>
                    setFormData({ ...formData, timeline_phase: value })
                  }
                  required
                >
                  <SelectTrigger
                    id="timeline_phase"
                    className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                  >
                    <SelectValue placeholder="Pilih fase" />
                    <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {CHECKLIST_TIMELINE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-foreground"
                >
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger
                    id="status"
                    className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                  >
                    <SelectValue placeholder="Pilih status" />
                    <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {CHECKLIST_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="priority"
                  className="text-sm font-medium text-foreground"
                >
                  Prioritas
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger
                    id="priority"
                    className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                  >
                    <SelectValue placeholder="Pilih prioritas" />
                    <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {CHECKLIST_PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="due_date"
                className="text-sm font-medium text-foreground"
              >
                Due Date
              </Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1 h-11 border-border hover:bg-secondary"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-md"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </div>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
