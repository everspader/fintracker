import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  addGroup,
  updateGroup,
  deleteGroup,
  getGroupTransactionCount,
  Group,
} from "@/app/actions/group-actions";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GroupListProps {
  groups: Group[];
  onDataChange: () => Promise<void>;
}

export default function GroupList({ groups, onDataChange }: GroupListProps) {
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({ name: "", categories: "" });
  const [updatedGroup, setUpdatedGroup] = useState<Group | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{
    id: string;
    transactionCount: number;
  } | null>(null);
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
      await addGroup(newGroup.name, categories);
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

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group.id);
    setUpdatedGroup({
      ...group,
      categories: [group.categories.join(", ")],
    });
  };

  const handleUpdateGroup = async (group: Group) => {
    setErrors({});
    try {
      if (!updatedGroup?.name.trim()) {
        setErrors({ [group.id]: "Group name cannot be empty" });
        return;
      }
      const categories = updatedGroup.categories[0]
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c);
      if (categories.length === 0) {
        setErrors({ [group.id]: "Please add at least one category" });
        return;
      }
      await updateGroup(group.id, updatedGroup.name, categories);
      setEditingGroup(null);
      setUpdatedGroup(null);
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

  const handleDeleteGroup = async (id: string) => {
    const transactionCount = await getGroupTransactionCount(id);
    setGroupToDelete({ id, transactionCount });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async (action: "cancel" | "setNull" | "deleteAll") => {
    if (action === "cancel") {
      setDeleteConfirmOpen(false);
      setGroupToDelete(null);
      return;
    }
    if (groupToDelete) {
      try {
        await deleteGroup(groupToDelete.id, action);
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
                    value={updatedGroup?.name}
                    onChange={(e) =>
                      setUpdatedGroup({
                        ...updatedGroup!,
                        name: e.target.value,
                      })
                    }
                    className={`col-span-5 ${
                      errors[group.id] ? "border-red-500" : ""
                    }`}
                  />
                  <Input
                    value={updatedGroup?.categories}
                    onChange={(e) =>
                      setUpdatedGroup({
                        ...updatedGroup!,
                        categories: [e.target.value],
                      })
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
                    onClick={() => {
                      setEditingGroup(null);
                      setUpdatedGroup(null);
                    }}
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
                    onClick={() => handleEditGroup(group)}
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
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              {groupToDelete && groupToDelete.transactionCount > 0 ? (
                <>
                  This group has {groupToDelete.transactionCount} transaction
                  {groupToDelete.transactionCount > 1 ? "s" : ""} associated
                  with it. What would you like to do?
                </>
              ) : (
                "Are you sure you want to delete this group? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => confirmDelete("cancel")}>
              Cancel
            </AlertDialogCancel>
            {groupToDelete && groupToDelete.transactionCount > 0 ? (
              <>
                <AlertDialogAction onClick={() => confirmDelete("setNull")}>
                  Set to Null
                </AlertDialogAction>
                <AlertDialogAction onClick={() => confirmDelete("deleteAll")}>
                  Delete All
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => confirmDelete("deleteAll")}>
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
