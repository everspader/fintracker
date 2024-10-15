import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  addGroup,
  updateGroup,
  deleteGroup,
  Group,
} from "@/app/actions/group-actions";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GroupListProps {
  groups: Group[];
  onDataChange: () => Promise<void>;
}

export default function GroupList({ groups, onDataChange }: GroupListProps) {
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({ name: "", categories: "" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const handleAddGroup = async () => {
    setErrors({});
    try {
      if (!newGroup.name.trim()) {
        setErrors({ name: "Group name cannot be empty" });
        return;
      }
      const categories = newGroup.categories
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c);
      if (categories.length === 0) {
        setErrors({ categories: "Please add at least one category" });
        return;
      }
      await addGroup({ ...newGroup, categories });
      setNewGroup({ name: "", categories: "" });
      toast({
        title: "Success",
        description: "Group added successfully.",
      });
      await onDataChange();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ add: error.message });
      }
    }
  };

  const handleUpdateGroup = async (group: Group) => {
    setErrors({});
    try {
      if (!group.name.trim()) {
        setErrors({ [group.id]: "Group name cannot be empty" });
        return;
      }
      if (group.categories.length === 0) {
        setErrors({ [group.id]: "Please add at least one category" });
        return;
      }
      await updateGroup(group);
      setEditingGroup(null);
      toast({
        title: "Success",
        description: "Group updated successfully.",
      });
      await onDataChange();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ [group.id]: error.message });
      }
    }
  };

  const handleDeleteGroup = (id: string) => {
    setGroupToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (groupToDelete) {
      try {
        await deleteGroup(groupToDelete);
        toast({
          title: "Success",
          description: "Group deleted successfully.",
        });
        await onDataChange();
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to delete group. Please try again.",
          variant: "destructive",
        });
      }
    }
    setDeleteConfirmOpen(false);
    setGroupToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <Input
          placeholder="New group name"
          value={newGroup.name}
          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
          className={`col-span-5 ${errors.name ? "border-red-500" : ""}`}
        />
        <Input
          placeholder="Categories (comma-separated)"
          value={newGroup.categories}
          onChange={(e) =>
            setNewGroup({ ...newGroup, categories: e.target.value })
          }
          className={`col-span-5 ${errors.categories ? "border-red-500" : ""}`}
        />
        <Button onClick={handleAddGroup} className="col-span-2">
          <Plus className="mr-2 h-4 w-4" /> Add Group
        </Button>
      </div>
      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      {errors.categories && (
        <p className="text-red-500 text-sm">{errors.categories}</p>
      )}
      {errors.add && <p className="text-red-500 text-sm">{errors.add}</p>}
      <ScrollArea className="h-[400px] w-full">
        <div className="space-y-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="grid grid-cols-12 items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {editingGroup === group.id ? (
                <>
                  <Input
                    value={group.name}
                    onChange={(e) => (group.name = e.target.value)}
                    className={`col-span-5 ${
                      errors[group.id] ? "border-red-500" : ""
                    }`}
                  />
                  <Input
                    value={group.categories.join(", ")}
                    onChange={(e) =>
                      (group.categories = e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter((c) => c))
                    }
                    className={`col-span-5 ${
                      errors[group.id] ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    onClick={() => handleUpdateGroup(group)}
                    size="sm"
                    className="col-span-1"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingGroup(null)}
                    size="sm"
                    className="col-span-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-medium col-span-5 pl-4">
                    {group.name}
                  </span>
                  <div className="col-span-5 flex flex-wrap gap-2">
                    {group.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingGroup(group.id)}
                    className="col-span-1"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="col-span-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Group"
        description="Are you sure you want to delete this group? This action cannot be undone."
      />
    </div>
  );
}
