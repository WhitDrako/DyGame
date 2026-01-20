import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { itemsApi, categoriesApi, usersApi } from '../utils/api';
import { Item, Category, AdminUser, Rarity } from '../types';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import {
  Shield,
  Package,
  Users,
  Folder,
  Plus,
  Edit,
  Trash2,
  Ban,
  UserCheck,
  Crown,
  Search,
  Save,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  formatValue,
  formatDateTime,
  getRarityClass,
  getRarityColor,
  getImageUrl,
} from '../utils/helpers';

type Tab = 'items' | 'categories' | 'users';
const RARITIES: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical', 'Event'];

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('items');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);

  // Edit states
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingType, setDeletingType] = useState<'item' | 'category' | 'user' | null>(null);
  const [banningUser, setBanningUser] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState('');

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    category_id: '',
    rarity: 'Common' as Rarity,
    current_value: 0,
    is_tradeable: true,
    is_unobtainable: false,
  });
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    display_order: 0,
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [itemsRes, categoriesRes, usersRes] = await Promise.all([
          itemsApi.getAll(),
          categoriesApi.getAll(),
          usersApi.getAll(),
        ]);
        setItems(itemsRes.data.items);
        setCategories(categoriesRes.data.categories);
        setUsers(usersRes.data.users);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Item handlers
  const openItemModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || '',
        category_id: item.category_id,
        rarity: item.rarity,
        current_value: item.current_value,
        is_tradeable: item.is_tradeable === 1,
        is_unobtainable: item.is_unobtainable === 1,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        category_id: categories[0]?.id || '',
        rarity: 'Common',
        current_value: 0,
        is_tradeable: true,
        is_unobtainable: false,
      });
    }
    setItemImage(null);
    setItemModalOpen(true);
  };

  const saveItem = async () => {
    const formData = new FormData();
    formData.append('name', itemForm.name);
    formData.append('description', itemForm.description);
    formData.append('category_id', itemForm.category_id);
    formData.append('rarity', itemForm.rarity);
    formData.append('current_value', itemForm.current_value.toString());
    formData.append('is_tradeable', itemForm.is_tradeable.toString());
    formData.append('is_unobtainable', itemForm.is_unobtainable.toString());
    if (itemImage) {
      formData.append('image', itemImage);
    }

    try {
      if (editingItem) {
        await itemsApi.update(editingItem.id, formData);
      } else {
        await itemsApi.create(formData);
      }
      // Refresh items
      const res = await itemsApi.getAll();
      setItems(res.data.items);
      setItemModalOpen(false);
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  // Category handlers
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        display_order: category.display_order,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: '',
        display_order: 0,
      });
    }
    setCategoryModalOpen(true);
  };

  const saveCategory = async () => {
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, categoryForm);
      } else {
        await categoriesApi.create(categoryForm);
      }
      // Refresh categories
      const res = await categoriesApi.getAll();
      setCategories(res.data.categories);
      setCategoryModalOpen(false);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  // Delete handlers
  const openDeleteModal = (id: string, type: 'item' | 'category' | 'user') => {
    setDeletingId(id);
    setDeletingType(type);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId || !deletingType) return;

    try {
      switch (deletingType) {
        case 'item':
          await itemsApi.delete(deletingId);
          setItems(items.filter((i) => i.id !== deletingId));
          break;
        case 'category':
          await categoriesApi.delete(deletingId);
          setCategories(categories.filter((c) => c.id !== deletingId));
          break;
        case 'user':
          await usersApi.delete(deletingId);
          setUsers(users.filter((u) => u.id !== deletingId));
          break;
      }
      setDeleteModalOpen(false);
      setDeletingId(null);
      setDeletingType(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete');
    }
  };

  // Ban handlers
  const openBanModal = (targetUser: AdminUser) => {
    setBanningUser(targetUser);
    setBanReason('');
    setBanModalOpen(true);
  };

  const confirmBan = async () => {
    if (!banningUser) return;

    try {
      await usersApi.ban(banningUser.id, banReason);
      setUsers(
        users.map((u) =>
          u.id === banningUser.id
            ? { ...u, is_banned: 1, ban_reason: banReason }
            : u
        )
      );
      setBanModalOpen(false);
      setBanningUser(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to ban user');
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      await usersApi.unban(userId);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_banned: 0, ban_reason: null } : u
        )
      );
    } catch (error) {
      console.error('Failed to unban user:', error);
    }
  };

  const toggleAdmin = async (userId: string) => {
    try {
      const res = await usersApi.toggleAdmin(userId);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_admin: res.data.isAdmin ? 1 : 0 } : u
        )
      );
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to toggle admin');
    }
  };

  if (isLoading) {
    return <Loading message="Loading admin panel..." />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="page-container">
        <div className="card p-12 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-4">Access Denied</h2>
          <p className="text-ocean-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">
          <Shield className="w-8 h-8 text-gold-400" />
          Admin Panel
        </h1>
        <p className="text-ocean-400">
          Manage items, categories, and users
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'items' as Tab, label: 'Items', icon: Package, count: items.length },
          { id: 'categories' as Tab, label: 'Categories', icon: Folder, count: categories.length },
          { id: 'users' as Tab, label: 'Users', icon: Users, count: users.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gold-500 text-ocean-900'
                : 'bg-ocean-800 text-ocean-300 hover:bg-ocean-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                activeTab === tab.id
                  ? 'bg-ocean-900/30 text-ocean-900'
                  : 'bg-ocean-700 text-ocean-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Add */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="input pl-10"
            />
          </div>
          {activeTab !== 'users' && (
            <button
              onClick={() =>
                activeTab === 'items' ? openItemModal() : openCategoryModal()
              }
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === 'items' ? 'Item' : 'Category'}
            </button>
          )}
        </div>
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ocean-800">
                <tr>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Item</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Rarity</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Value</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ocean-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-ocean-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-ocean-700 rounded-lg flex items-center justify-center">
                          {item.image_path ? (
                            <img
                              src={getImageUrl(item.image_path)}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Sparkles
                              className="w-5 h-5"
                              style={{ color: getRarityColor(item.rarity) }}
                            />
                          )}
                        </div>
                        <span className="text-white font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ocean-300">
                      {item.category_name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getRarityClass(
                          item.rarity
                        )}`}
                      >
                        {item.rarity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gold-400 font-medium">
                      {formatValue(item.current_value)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openItemModal(item)}
                          className="p-2 text-ocean-400 hover:text-white hover:bg-ocean-700 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item.id, 'item')}
                          className="p-2 text-ocean-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ocean-800">
                <tr>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Description</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Items</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Order</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ocean-700">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-ocean-800/50">
                    <td className="px-4 py-3 text-white font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-ocean-300">
                      {category.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-ocean-300">
                      {category.item_count || 0}
                    </td>
                    <td className="px-4 py-3 text-ocean-300">
                      {category.display_order}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openCategoryModal(category)}
                          className="p-2 text-ocean-400 hover:text-white hover:bg-ocean-700 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category.id, 'category')}
                          className="p-2 text-ocean-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ocean-800">
                <tr>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">User</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Created</th>
                  <th className="px-4 py-3 text-left text-ocean-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ocean-700">
                {filteredUsers.map((targetUser) => (
                  <tr key={targetUser.id} className="hover:bg-ocean-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {targetUser.username}
                        </span>
                        {targetUser.is_admin === 1 && (
                          <Crown className="w-4 h-4 text-gold-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ocean-300">{targetUser.email}</td>
                    <td className="px-4 py-3">
                      {targetUser.is_banned === 1 ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-medium">
                          BANNED
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-medium">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ocean-300">
                      {formatDateTime(targetUser.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {targetUser.is_banned === 1 ? (
                          <button
                            onClick={() => unbanUser(targetUser.id)}
                            className="p-2 text-green-400 hover:bg-green-500/10 rounded transition-colors"
                            title="Unban"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openBanModal(targetUser)}
                            className="p-2 text-orange-400 hover:bg-orange-500/10 rounded transition-colors"
                            title="Ban"
                            disabled={
                              targetUser.username.toLowerCase() === 'whitedrako'
                            }
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleAdmin(targetUser.id)}
                          className={`p-2 rounded transition-colors ${
                            targetUser.is_admin === 1
                              ? 'text-gold-400 hover:bg-gold-500/10'
                              : 'text-ocean-400 hover:bg-ocean-700'
                          }`}
                          title={
                            targetUser.is_admin === 1
                              ? 'Remove Admin'
                              : 'Make Admin'
                          }
                          disabled={
                            targetUser.username.toLowerCase() === 'whitedrako'
                          }
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(targetUser.id, 'user')}
                          className="p-2 text-ocean-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete"
                          disabled={
                            targetUser.username.toLowerCase() === 'whitedrako'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Modal */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? 'Edit Item' : 'Add Item'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              className="input"
              placeholder="Item name"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={itemForm.description}
              onChange={(e) =>
                setItemForm({ ...itemForm, description: e.target.value })
              }
              className="input min-h-[100px]"
              placeholder="Item description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select
                value={itemForm.category_id}
                onChange={(e) =>
                  setItemForm({ ...itemForm, category_id: e.target.value })
                }
                className="select"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Rarity *</label>
              <select
                value={itemForm.rarity}
                onChange={(e) =>
                  setItemForm({ ...itemForm, rarity: e.target.value as Rarity })
                }
                className="select"
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Current Value *</label>
            <input
              type="number"
              value={itemForm.current_value}
              onChange={(e) =>
                setItemForm({ ...itemForm, current_value: parseInt(e.target.value) || 0 })
              }
              className="input"
              placeholder="Value in Beli"
            />
          </div>

          <div>
            <label className="label">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setItemImage(e.target.files?.[0] || null)}
              className="input"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.is_tradeable}
                onChange={(e) =>
                  setItemForm({ ...itemForm, is_tradeable: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-ocean-300">Tradeable</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.is_unobtainable}
                onChange={(e) =>
                  setItemForm({ ...itemForm, is_unobtainable: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-ocean-300">Unobtainable</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-ocean-700">
            <button
              onClick={() => setItemModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={saveItem} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingItem ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              className="input"
              placeholder="Category name"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, description: e.target.value })
              }
              className="input min-h-[100px]"
              placeholder="Category description"
            />
          </div>

          <div>
            <label className="label">Display Order</label>
            <input
              type="number"
              value={categoryForm.display_order}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  display_order: parseInt(e.target.value) || 0,
                })
              }
              className="input"
              placeholder="0"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-ocean-700">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={saveCategory}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-2">Are you sure you want to delete this {deletingType}?</p>
          <p className="text-ocean-400 text-sm mb-6">This action cannot be undone.</p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={confirmDelete} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Ban Modal */}
      <Modal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        title="Ban User"
        size="sm"
      >
        <div>
          <p className="text-white mb-4">
            You are about to ban <strong>{banningUser?.username}</strong>. This
            will completely block their access to the site.
          </p>

          <div className="mb-6">
            <label className="label">Reason (optional)</label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Enter ban reason..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setBanModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={confirmBan} className="btn-danger flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Ban User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
