"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "./badge";
import { Input } from "./input";

interface TagInputProps {
  placeholder?: string;
  tags: string[];
  onTagChange: (tags: string[]) => void;
  className?: string;
}

export function TagInput({
  placeholder,
  tags,
  onTagChange,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      onTagChange([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={`flex flex-wrap gap-2 p-2 border rounded-md ${className}`}>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {tag}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => removeTag(tag)}
          />
        </Badge>
      ))}
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        className="flex-grow border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
