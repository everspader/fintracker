"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { PlusCircle, X } from "lucide-react";
import { createGroup, updateGroup } from "@/app/actions/group-actions";
import { cn } from "@/lib/utils";

type FormError = {
  field: string;
  message: string;
};

interface GroupFormProps {
  initialData?: {
    id: string;
    name: string;
    categories: string[];
  };
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export function GroupForm({
  initialData,
  onSubmitSuccess,
  onCancel,
}: GroupFormProps) {
  const [groupName, setGroupName] = useState(initialData?.name || "");
  const [categories, setCategories] = useState<string[]>(
    initialData?.categories || []
  );
  const [categoryInput, setCategoryInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<FormError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditMode = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setGroupName(initialData.name);
      setCategories(initialData.categories);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      let result;
      if (isEditMode) {
        result = await updateGroup(initialData.id, groupName, categories);
      } else {
        result = await createGroup(groupName, categories);
      }

      if (result.success) {
        setSuccessMessage(
          `Group "${groupName}" ${
            isEditMode ? "updated" : "created"
          } successfully.`
        );
        if (!isEditMode) {
          // Reset form only for create mode
          setGroupName("");
          setCategories([]);
          setCategoryInput("");
        }
        onSubmitSuccess?.();
      } else {
        setFormError({ field: "groupName", message: result.error! });
      }
    } catch (error) {
      setFormError({
        field: "groupName",
        message:
          error instanceof Error
            ? error.message
            : `Failed to ${
                isEditMode ? "update" : "create"
              } group. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = () => {
    if (
      categoryInput.trim() !== "" &&
      !categories.includes(categoryInput.trim())
    ) {
      setCategories([...categories, categoryInput.trim()]);
      setCategoryInput("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] pointer-events-none" />
      <Card className="w-full max-w-md bg-gray-800 text-gray-100 shadow-xl border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isEditMode ? "Edit Group" : "Create New Group"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <p className="text-green-400 text-sm mt-2">{successMessage}</p>
            )}
            <div className="space-y-2">
              <label
                htmlFor="groupName"
                className="text-sm font-medium text-gray-300"
              >
                Group Name
              </label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={cn(
                  "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500",
                  formError?.field === "groupName" &&
                    "border-red-500 focus:ring-red-500 focus:border-red-500"
                )}
                placeholder="Enter group name"
                required
              />
              {formError?.field === "groupName" && (
                <p className="text-red-400 text-sm mt-2">{formError.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="categories"
                className="text-sm font-medium text-gray-300"
              >
                Categories
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((category, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gray-700 text-gray-100"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category)}
                      className="ml-1 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="categoryInput"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a category"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  isEditMode ? (
                    "Updating..."
                  ) : (
                    "Creating..."
                  )
                ) : (
                  <React.Fragment>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isEditMode ? "Update Group" : "Create Group"}
                  </React.Fragment>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
