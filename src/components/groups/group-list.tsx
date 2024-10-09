"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { getGroups, deleteGroup } from "@/app/actions/group-actions";
import { GroupForm } from "@/components/groups/group-form";

interface Group {
  id: string;
  name: string;
  categories: string[];
}

export function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const fetchedGroups = await getGroups();
    setGroups(fetchedGroups);
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
  };

  const handleDelete = async (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      await deleteGroup(groupId);
      fetchGroups();
    }
  };

  const handleGroupUpdated = () => {
    setEditingGroup(null);
    fetchGroups();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <Card className="w-full max-w-4xl mx-auto bg-gray-800 text-gray-100 shadow-xl border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Manage Groups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingGroup ? (
            <GroupForm
              initialData={editingGroup}
              onSubmitSuccess={handleGroupUpdated}
              onCancel={() => setEditingGroup(null)}
            />
          ) : (
            <>
              <Button
                onClick={() =>
                  setEditingGroup({ id: "", name: "", categories: [] })
                }
                className="mb-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create New Group
              </Button>
              <div className="space-y-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{group.name}</h3>
                      <p className="text-sm text-gray-400">
                        Categories: {group.categories.join(", ")}
                      </p>
                    </div>
                    <div>
                      <Button
                        onClick={() => handleEdit(group)}
                        className="mr-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(group.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
