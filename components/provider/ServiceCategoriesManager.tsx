"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ServiceCategory } from "@/types";
import { Plus, Edit2, Trash2, MoreVertical, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import ServiceCategoryModal from "@/components/provider/ServiceCategoryModal";

interface ServiceCategoriesManagerProps {
  businessId: number;
}

export default function ServiceCategoriesManager({ businessId }: ServiceCategoriesManagerProps) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["service-categories", businessId],
    queryFn: () => api.getServiceCategories(businessId, false),
  });

  const categories = data?.categories || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createServiceCategory(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories", businessId] });
      toast.success("Category created");
      setShowModal(false);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.updateServiceCategory(businessId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories", businessId] });
      toast.success("Category updated");
      setShowModal(false);
      setEditingCategory(null);
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteServiceCategory(businessId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories", businessId] });
      toast.success("Category deleted");
      setActiveMenu(null);
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category: ServiceCategory) => {
    setEditingCategory(category);
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);

    queryClient.setQueryData(["service-categories", businessId], {
      categories: newCategories,
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    toast.success("Order updated");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleCreate}
        className="w-full mb-4 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        New Category
      </button>

      {categories.length === 0 ? (
        <div className="text-center py-8 px-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-3">No categories yet</p>
          <button
            onClick={handleCreate}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category, index) => (
            <div
              key={category.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors relative cursor-move ${
                draggedIndex === index ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div
                  className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {category.services_count} {category.services_count === 1 ? "service" : "services"}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === category.id ? null : category.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {activeMenu === category.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setActiveMenu(null)}
                      />
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={() => handleEdit(category)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ServiceCategoryModal
          businessId={businessId}
          category={editingCategory}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
