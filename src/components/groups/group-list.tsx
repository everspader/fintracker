"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";
import {
  getGroups,
  updateGroup,
  deleteGroup,
  createGroup,
} from "@/app/actions/group-actions";

interface Group {
  id: string;
  name: string;
  categories: string[];
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCategories, setNewGroupCategories] = useState<string[]>([]);
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const fetchedGroups = await getGroups();
    setGroups(fetchedGroups);
  };

  const handleToggleExpand = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
    setEditingGroup(null);
    setValidationErrors({});
  };

  const handleEdit = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroup(groupId);
    setExpandedGroup(groupId);
    setValidationErrors({});
  };

  const handleCancelEdit = (groupId: string) => {
    setEditingGroup(null);
    setValidationErrors({});
    // Reset the group to its original state
    fetchGroups();
  };

  const handleDelete = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this group?")) {
      await deleteGroup(groupId);
      fetchGroups();
    }
  };

  const validateGroup = (name: string, categories: string[]): boolean => {
    const errors: { [key: string]: string } = {};
    if (name.trim() === "") {
      errors.name = "Group name cannot be blank";
    }
    if (categories.filter((cat) => cat.trim() !== "").length === 0) {
      errors.categories = "Group must have at least one category";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateGroup = async (group: Group) => {
    const trimmedCategories = group.categories.filter(
      (cat) => cat.trim() !== ""
    );
    if (validateGroup(group.name, trimmedCategories)) {
      await updateGroup(group.id, group.name, trimmedCategories);
      setEditingGroup(null);
      fetchGroups();
    }
  };

  const handleCreateNewGroup = async () => {
    const trimmedCategories = newGroupCategories.filter(
      (cat) => cat.trim() !== ""
    );
    if (validateGroup(newGroupName, trimmedCategories)) {
      await createGroup(newGroupName.trim(), trimmedCategories);
      setNewGroupName("");
      setNewGroupCategories([]);
      setIsAddingNewGroup(false);
      fetchGroups();
    }
  };

  const handleAddCategory = (group: Group) => {
    if (!group.categories.some((cat) => cat.trim() === "")) {
      const updatedGroup = { ...group, categories: [...group.categories, ""] };
      setGroups(groups.map((g) => (g.id === group.id ? updatedGroup : g)));
    }
  };

  const handleAddNewGroupCategory = () => {
    if (!newGroupCategories.some((cat) => cat.trim() === "")) {
      setNewGroupCategories([...newGroupCategories, ""]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <Card className="w-full max-w-2xl mx-auto bg-gray-800 text-gray-100 shadow-xl border-gray-700">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Groups</h2>
          <Button
            onClick={() => setIsAddingNewGroup(!isAddingNewGroup)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAddingNewGroup ? (
              <X className="h-5 w-5 mr-2" />
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            {isAddingNewGroup ? "Cancel" : "Add New"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAddingNewGroup && (
            <div className="border border-gray-700 rounded-lg p-4 space-y-4">
              <div>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New group name"
                  className={`bg-white text-gray-900 ${
                    validationErrors.name ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                {newGroupCategories.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-grow relative">
                      <Input
                        value={category}
                        onChange={(e) => {
                          const updatedCategories = [...newGroupCategories];
                          updatedCategories[index] = e.target.value;
                          setNewGroupCategories(updatedCategories);
                        }}
                        placeholder={`Category ${index + 1}`}
                        className="bg-white text-gray-900 pr-8"
                      />
                      <button
                        onClick={() =>
                          setNewGroupCategories(
                            newGroupCategories.filter((_, i) => i !== index)
                          )
                        }
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {validationErrors.categories && (
                  <p className="text-red-500 text-sm">
                    {validationErrors.categories}
                  </p>
                )}
                <Button
                  onClick={handleAddNewGroupCategory}
                  className="w-full bg-gray-600 hover:bg-gray-700"
                  disabled={newGroupCategories.some((cat) => cat.trim() === "")}
                >
                  <Plus className="h-5 w-5 mr-2" /> Add Category
                </Button>
              </div>
              <Button
                onClick={handleCreateNewGroup}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={
                  newGroupName.trim() === "" ||
                  newGroupCategories.filter((cat) => cat.trim() !== "")
                    .length === 0
                }
              >
                Create Group
              </Button>
            </div>
          )}
          {groups.map((group) => (
            <div
              key={group.id}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer"
                onClick={() => handleToggleExpand(group.id)}
              >
                <div className="flex items-center space-x-2">
                  {expandedGroup === group.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                </div>
                <div>
                  <Button
                    onClick={(e) => handleEdit(group.id, e)}
                    className="mr-2 bg-gray-600 hover:bg-gray-700 text-white p-2"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={(e) => handleDelete(group.id, e)}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              {expandedGroup === group.id && (
                <div className="p-3 bg-gray-800">
                  {editingGroup === group.id ? (
                    <div className="space-y-2">
                      <div>
                        <Input
                          value={group.name}
                          onChange={(e) => {
                            const updatedGroup = {
                              ...group,
                              name: e.target.value,
                            };
                            setGroups(
                              groups.map((g) =>
                                g.id === group.id ? updatedGroup : g
                              )
                            );
                          }}
                          className={`bg-white text-gray-900 mb-2 ${
                            validationErrors.name ? "border-red-500" : ""
                          }`}
                        />
                        {validationErrors.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.name}
                          </p>
                        )}
                      </div>
                      <Separator className="my-4" />
                      {group.categories.map((category, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-grow relative">
                            <Input
                              value={category}
                              onChange={(e) => {
                                const newCategories = [...group.categories];
                                newCategories[index] = e.target.value;
                                const updatedGroup = {
                                  ...group,
                                  categories: newCategories,
                                };
                                setGroups(
                                  groups.map((g) =>
                                    g.id === group.id ? updatedGroup : g
                                  )
                                );
                              }}
                              className="bg-white text-gray-900 pr-8"
                            />
                            <button
                              onClick={() => {
                                const newCategories = group.categories.filter(
                                  (_, i) => i !== index
                                );
                                const updatedGroup = {
                                  ...group,
                                  categories: newCategories,
                                };
                                setGroups(
                                  groups.map((g) =>
                                    g.id === group.id ? updatedGroup : g
                                  )
                                );
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {validationErrors.categories && (
                        <p className="text-red-500 text-sm">
                          {validationErrors.categories}
                        </p>
                      )}
                      <Button
                        onClick={() => handleAddCategory(group)}
                        className="w-full bg-gray-600 hover:bg-gray-700"
                        disabled={group.categories.some(
                          (cat) => cat.trim() === ""
                        )}
                      >
                        <Plus className="h-5 w-5 mr-2" /> Add Category
                      </Button>
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => handleUpdateGroup(group)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={
                            group.name.trim() === "" ||
                            group.categories.filter((cat) => cat.trim() !== "")
                              .length === 0
                          }
                        >
                          <Save className="h-5 w-5 mr-2" /> Save Changes
                        </Button>
                        <Button
                          onClick={() => handleCancelEdit(group.id)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400 mb-2">Categories:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.categories.map((category, index) => (
                          <div
                            key={index}
                            className="bg-gray-700 rounded p-2 text-sm"
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
