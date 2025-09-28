import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const CATEGORIES = [
  'Baking',
  'Beverages',
  'Dairy',
  'Produce',
  'Proteins',
  'Condiments',
  'Frozen',
  'Supplies',
  'Baking Ingredients'
];

export default function AddProductForm({ isOpen, onClose, onSubmit }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    item_id: '',
    name: '',
    category: 'Baking',
    current_stock: '',
    unit: '',
    cost_per_unit: '',
    reorder_point: '',
    supplier: '',
    sku: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.item_id.trim()) newErrors.item_id = 'Item ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.current_stock || isNaN(formData.current_stock) || parseFloat(formData.current_stock) < 0) {
      newErrors.current_stock = 'Valid current stock is required';
    }
    if (!formData.unit.trim()) newErrors.unit = 'Unit is required';
    if (!formData.cost_per_unit || isNaN(formData.cost_per_unit) || parseFloat(formData.cost_per_unit) < 0) {
      newErrors.cost_per_unit = 'Valid cost per unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert string numbers to floats
      const submitData = {
        ...formData,
        current_stock: parseFloat(formData.current_stock),
        daily_usage: 1.0, // Default value
        cost_per_unit: parseFloat(formData.cost_per_unit),
        reorder_point: formData.reorder_point ? parseFloat(formData.reorder_point) : null
      };

      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        item_id: '',
        name: '',
        category: 'Baking',
        current_stock: '',
        unit: '',
            cost_per_unit: '',
        reorder_point: '',
        supplier: '',
        sku: ''
      });
      setErrors({});
      onClose();
      
      // Redirect to dashboard and reload to ensure fresh data
      navigate('/dashboard');
      window.location.reload();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to add product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6 mt-4">
            <h2 className="text-xl font-semibold">Add New Product</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item ID */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Item ID <span className="text-red-500">*</span>
                </label>
                <Input
                  name="item_id"
                  value={formData.item_id}
                  onChange={handleInputChange}
                  placeholder="e.g., COFFEE001"
                  className={errors.item_id ? 'border-red-500' : ''}
                />
                {errors.item_id && <p className="text-red-500 text-xs mt-1">{errors.item_id}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Premium Coffee Beans"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Current Stock */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Stock <span className="text-red-500">*</span>
                </label>
                <Input
                  name="current_stock"
                  type="number"
                  step="0.01"
                  value={formData.current_stock}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={errors.current_stock ? 'border-red-500' : ''}
                />
                {errors.current_stock && <p className="text-red-500 text-xs mt-1">{errors.current_stock}</p>}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <Input
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., kg, boxes, liters"
                  className={errors.unit ? 'border-red-500' : ''}
                />
                {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
              </div>


              {/* Cost Per Unit */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cost Per Unit <span className="text-red-500">*</span>
                </label>
                <Input
                  name="cost_per_unit"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_unit}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={errors.cost_per_unit ? 'border-red-500' : ''}
                />
                {errors.cost_per_unit && <p className="text-red-500 text-xs mt-1">{errors.cost_per_unit}</p>}
              </div>

              {/* Reorder Point */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reorder Point
                </label>
                <Input
                  name="reorder_point"
                  type="number"
                  step="0.01"
                  value={formData.reorder_point}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Supplier
                </label>
                <Input
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>

              {/* SKU */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  SKU
                </label>
                <Input
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>
            </div>

            {errors.submit && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Adding Product...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}