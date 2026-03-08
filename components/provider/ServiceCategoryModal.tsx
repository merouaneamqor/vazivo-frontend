"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ServiceCategory } from "@/types";
import { X, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface ServiceCategoryModalProps {
  businessId: number;
  category: ServiceCategory | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Green
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
];

export default function ServiceCategoryModal({
  businessId,
  category,
  onClose,
  onSubmit,
}: ServiceCategoryModalProps) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [color, setColor] = useState(category?.color || "#3B82F6");
  const [generatingDescription, setGeneratingDescription] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
      setColor(category.color);
    }
  }, [category]);

  const handleGenerateDescription = async () => {
    if (!name.trim()) {
      toast.error("Enter a category name first");
      return;
    }

    setGeneratingDescription(true);
    try {
      // Clear existing description while generating a new one via Next.js AI SDK + OpenRouter.
      setDescription("");

      const response = await fetch("/api/provider/generate-category-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          categoryName: name.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          errorData?.error || "Failed to generate description with AI";
        throw new Error(message);
      }

      const data = await response.json();
      setDescription(data.description || "");
      toast.success("Description generated with AI");
    } catch (error) {
      console.error(error);
      // Fallback: simple local template if AI is unavailable.
      const templates = [
        `Professional ${name} services tailored to your needs.`,
        `Expert ${name} treatments delivered with care and precision.`,
        `High-quality ${name} services for the best results.`,
      ];
      setDescription(templates[Math.floor(Math.random() * templates.length)]);
      toast.error(
        error instanceof Error ? error.message : "AI unavailable – using a simple template instead"
      );
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    onSubmit({ name, description, color });
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? "Edit Category" : "Add Category"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Hair Services, Nail Services"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              This name will appear in your service menu and to clients when booking
            </p>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment color
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    color === presetColor ? "border-gray-900 scale-110" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                title="Custom color"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Choose a color to visually identify services in this category
            </p>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generatingDescription}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {generatingDescription ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short summary that helps clients understand what types of services are included..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Help clients understand what types of services are included in this category
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Preview</p>
            <div
              className="bg-white rounded-lg p-3 border-l-4"
              style={{ borderLeftColor: color }}
            >
              <h4 className="font-medium text-gray-900">{name || "Category Name"}</h4>
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              {category ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
