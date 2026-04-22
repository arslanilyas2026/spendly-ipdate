import React, { useState } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import TopBar from '@/components/layout/TopBar';
import { useCategories } from '@/hooks/useCategories';
import { t } from '@/utils/translations';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { Category } from '@/types';
import { generateId } from '@/utils/dateHelpers';
import CategoryIcon, { ICON_KEYS, ICON_MAP } from '@/components/ui/CategoryIcon';
import BottomSheet from '@/components/ui/BottomSheet';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const CATEGORY_COLORS = [
  '#3B82F6', '#8B5CF6', '#D946EF', '#EC4899', '#F43F5E',
  '#F97316', '#F59E0B', '#EA580C', '#EF4444', '#0D9488',
  '#14B8A6', '#10B981', '#0EA5E9', '#6366F1', '#6B7280',
];

export default function CategoriesScreen() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('shopping-bag');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filtered = categories.filter(c => c.type === activeTab);

  const openAdd = () => {
    setEditingCat(null);
    setName('');
    setIcon(activeTab === 'expense' ? 'shopping-bag' : 'wallet');
    setColor(CATEGORY_COLORS[0]);
    setShowForm(true);
    setShowIconPicker(false);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setShowForm(true);
    setShowIconPicker(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingCat) {
      updateCategory(editingCat.id, { name: name.trim(), icon, color });
    } else {
      const cat: Category = {
        id: generateId(),
        name: name.trim(),
        icon,
        color,
        type: activeTab,
        isDefault: false,
      };
      addCategory(cat);
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (editingCat) {
      deleteCategory(editingCat.id);
      setShowDeleteConfirm(false);
      setShowForm(false);
    }
  };

  const SelectedIcon = ICON_MAP[icon];

  return (
    <PageWrapper>
      <TopBar
        title={t('manage_categories')}
        showBack
        right={
          <button onClick={openAdd} className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent/10">
            <Plus className="w-5 h-5 text-accent" />
          </button>
        }
      />

      <div className="px-4 pb-4">
        {/* Tabs */}
        <div className="flex bg-bg-secondary rounded-xl p-1 mb-4">
          {(['expense', 'income'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-bg-card text-text-primary card-shadow' : 'text-text-muted'
              }`}
            >
              {tab === 'expense' ? t('expense') : t('income')}
            </button>
          ))}
        </div>

        {/* Category List — compact rows */}
        <div className="space-y-1.5">
          {filtered.map((cat) => (
            <button
              key={cat.id}
              onClick={() => openEdit(cat)}
              className="w-full bg-bg-card rounded-xl px-3 py-2.5 card-shadow flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
            >
              <CategoryIcon icon={cat.icon} color={cat.color} size={36} />
              <span className="text-sm font-medium text-text-primary flex-1">{cat.name}</span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 flex flex-col items-center mt-4">
            <span className="text-4xl mb-3">📂</span>
            <p className="text-sm text-text-muted text-center">No categories yet</p>
          </div>
        )}
      </div>

      {/* Edit/Add Form */}
      <BottomSheet open={showForm} onClose={() => setShowForm(false)} title={editingCat ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          {/* Live Preview */}
          <div className="bg-bg-secondary rounded-xl p-3 flex items-center gap-3">
            <CategoryIcon icon={icon} color={color} size={40} />
            <div className="flex-1 min-w-0">
              <div className="h-2.5 rounded-full bg-text-muted/20 w-3/4 mb-1.5" />
              <div className="h-2 rounded-full bg-text-muted/10 w-1/2" />
            </div>
          </div>

          {/* Color Picker — small circles, scrollable */}
          <div className="flex gap-2 overflow-x-auto py-1 px-0.5">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`flex-shrink-0 w-7 h-7 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-accent scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Name + Icon row */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <label className="absolute top-1.5 left-3 text-[10px] text-text-muted">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shopping, Rent..."
                className="w-full h-14 bg-bg-input rounded-xl px-3 pt-5 text-sm text-text-primary placeholder:text-text-muted outline-none border border-border focus:border-accent transition-colors"
              />
            </div>
            <button
              onClick={() => setShowIconPicker(true)}
              className="w-14 h-14 bg-bg-input rounded-xl border border-border flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
            >
              {SelectedIcon && <SelectedIcon className="w-5 h-5" style={{ color }} />}
            </button>
          </div>

          {/* Delete option */}
          {editingCat && !editingCat.isDefault && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full h-11 rounded-xl border border-destructive/30 text-destructive text-sm font-medium"
            >
              Delete Category
            </button>
          )}

          <button
            onClick={handleSave}
            className="w-full h-11 rounded-xl bg-accent text-primary-foreground font-medium text-sm"
          >
            Save Category
          </button>
        </div>
      </BottomSheet>

      {/* Icon Picker Sheet */}
      <BottomSheet open={showIconPicker} onClose={() => setShowIconPicker(false)} title="Select an Icon">
        <div className="grid grid-cols-6 gap-2 max-h-[55vh] overflow-y-auto pb-4">
          {ICON_KEYS.map((key) => {
            const Ic = ICON_MAP[key];
            return (
              <button
                key={key}
                onClick={() => { setIcon(key); setShowIconPicker(false); }}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all border ${
                  icon === key
                    ? 'bg-accent/15 border-accent'
                    : 'bg-bg-secondary border-transparent'
                }`}
              >
                <Ic className="w-5 h-5" style={{ color: icon === key ? color : 'var(--text-muted)' }} />
              </button>
            );
          })}
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Category?"
        message="This will permanently remove this category."
      />
    </PageWrapper>
  );
}
