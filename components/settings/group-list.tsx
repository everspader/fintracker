"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "@/app/actions/group-actions";

interface Group {
  id: string;
  name: string;
  categories: string[];
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({ name: "", categories: [] });
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const fetchedGroups = await getGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast({
        title: "Error",
        description: "Failed to load groups. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddGroup = async () => {
    try {
      const result = await createGroup(newGroup.name, newGroup.categories);
      if (result.success) {
        await fetchGroups();
        setNewGroup({ name: "", categories: [] });
        toast({
          title: "Success",
          description: "Group added successfully.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to add group:", error);
      toast({
        title: "Error",
        description: "Failed to add group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGroup = async (group: Group) => {
    try {
      const result = await updateGroup(group.id, group.name, group.categories);
      if (result.success) {
        await fetchGroups();
        setEditingGroup(null);
        toast({
          title: "Success",
          description: "Group updated successfully.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to update group:", error);
      toast({
        title: "Error",
        description: "Failed to update group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        const result = await deleteGroup(id);
        if (result.success) {
          await fetchGroups();
          toast({
            title: "Success",
            description: "Group deleted successfully.",
          });
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Failed to delete group:", error);
        toast({
          title: "Error",
          description: "Failed to delete group. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Groups & Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="New group name"
              value={newGroup.name}
              onChange={(e) =>
                setNewGroup({ ...newGroup, name: e.target.value })
              }
            />
            <Input
              placeholder="Categories (comma-separated)"
              value={newGroup.categories.join(", ")}
              onChange={(e) =>
                setNewGroup({
                  ...newGroup,
                  categories: e.target.value.split(",").map((c) => c.trim()),
                })
              }
            />
            <Button onClick={handleAddGroup}>
              <Plus className="mr-2 h-4 w-4" /> Add Group
            </Button>
          </div>
          {groups.map((group) => (
            <div key={group.id} className="space-y-2">
              {editingGroup === group.id ? (
                <>
                  <Input
                    value={group.name}
                    onChange={(e) =>
                      setGroups(
                        groups.map((g) =>
                          g.id === group.id ? { ...g, name: e.target.value } : g
                        )
                      )
                    }
                  />
                  <Input
                    value={group.categories.join(", ")}
                    onChange={(e) =>
                      setGroups(
                        groups.map((g) =>
                          g.id === group.id
                            ? {
                                ...g,
                                categories: e.target.value
                                  .split(",")
                                  .map((c) => c.trim()),
                              }
                            : g
                        )
                      )
                    }
                  />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleUpdateGroup(group)}>
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingGroup(null)}
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    <p className="text-sm text-gray-500">
                      Categories: {group.categories.join(", ")}
                    </p>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingGroup(group.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
