'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { Edit, Laptop, Monitor, MoreVertical, Network, Plus, Printer, Search, Server, Smartphone, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface ITAsset {
  _id: string;
  assetTag: string;
  name: string;
  type: 'server' | 'laptop' | 'desktop' | 'network_device' | 'printer' | 'mobile' | 'peripheral' | 'other';
  status: 'active' | 'maintenance' | 'retired' | 'broken' | 'in_stock';
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  ipAddress?: string;
  macAddress?: string;
  location?: string;
  assignedTo?: {
    userId: string;
    firstName: string;
    lastName: string;
    assignedDate: Date;
  };
  notes?: string;
}

export default function ITAssetsPage() {
  const [assets, setAssets] = useState<ITAsset[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ITAsset | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ITAsset>>({
    type: 'laptop',
    status: 'in_stock',
  });

  useEffect(() => {
    loadAssets();
  }, [filterType]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const queryString = filterType !== 'all' ? `?type=${filterType}` : '';
      const res = await api.get(`/api/it-assets${queryString}`);
      setAssets(res.data.data || []); // Adjusted to match generic API response structure usually { success: true, data: [...] }
    } catch (error) {
      console.error('Failed to load assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAsset(null);
    setFormData({ type: 'laptop', status: 'in_stock' });
    setIsDialogOpen(true);
  };

  const handleEdit = (asset: ITAsset) => {
    setEditingAsset(asset);
    setFormData({ ...asset });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await api.delete(`/api/it-assets/${id}`);
      toast.success('Asset deleted successfully');
      loadAssets();
    } catch (error) {
      console.error('Failed to delete asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await api.put(`/api/it-assets/${editingAsset._id}`, formData);
        toast.success('Asset updated successfully');
      } else {
        await api.post('/api/it-assets', formData);
        toast.success('Asset created successfully');
      }
      setIsDialogOpen(false);
      loadAssets();
    } catch (error) {
      console.error('Failed to save asset:', error);
      toast.error('Failed to save asset');
    }
  };

  const filteredAssets = assets.filter((asset) =>
    asset.name?.toLowerCase().includes(search.toLowerCase()) ||
    asset.assetTag?.toLowerCase().includes(search.toLowerCase()) ||
    asset.ipAddress?.toLowerCase().includes(search.toLowerCase()) ||
    asset.serialNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'server': return <Server className="h-5 w-5 text-blue-600" />;
      case 'laptop': return <Laptop className="h-5 w-5 text-green-600" />;
      case 'desktop': return <Monitor className="h-5 w-5 text-indigo-600" />;
      case 'network_device': return <Network className="h-5 w-5 text-purple-600" />;
      case 'mobile': return <Smartphone className="h-5 w-5 text-orange-600" />;
      case 'printer': return <Printer className="h-5 w-5 text-gray-600" />;
      default: return <Server className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      in_stock: 'bg-blue-100 text-blue-800 border-blue-200',
      maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      retired: 'bg-gray-100 text-gray-800 border-gray-200',
      broken: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading && assets.length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading IT Assets...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IT Assets Inventory</h1>
          <p className="text-gray-500 mt-1">Manage hardware, track assignments, and monitor status.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadAssets()}>
                <span className="mr-2">   </span> Refresh
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
            </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, tag, IP, serial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="network_device">Network Device</SelectItem>
                    <SelectItem value="printer">Printer</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => (
          <Card key={asset._id} className="hover:shadow-md transition-shadow group relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                     {getAssetIcon(asset.type)}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{asset.name}</CardTitle>
                    <p className="text-xs text-gray-500 font-mono">{asset.assetTag}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(asset)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(asset._id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                    {getStatusBadge(asset.status)}
                    <span className="text-xs text-gray-400 capitalize">{asset.manufacturer}</span>
                </div>

                <div className="text-sm space-y-1.5 pt-2 border-t">
                    {asset.ipAddress && (
                    <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">IP Address</span>
                        <span className="font-mono text-xs">{asset.ipAddress}</span>
                    </div>
                    )}
                    {asset.serialNumber && (
                    <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Serial</span>
                        <span className="font-mono text-xs">{asset.serialNumber}</span>
                    </div>
                    )}
                    {asset.assignedTo ? (
                    <div className="flex justify-between items-center bg-blue-50 p-1.5 rounded text-xs">
                        <span className="text-blue-700">Assigned to:</span>
                        <span className="font-medium text-blue-900">
                        {asset.assignedTo.firstName} {asset.assignedTo.lastName}
                        </span>
                    </div>
                    ) : (
                        <div className="text-xs text-center text-gray-400 italic py-1">Unassigned</div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredAssets.length === 0 && (
        <Card className="py-16 border-dashed">
          <CardContent className="text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Server className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No assets found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {search ? 'No assets match your search criteria.' : 'Get started by adding your first hardware asset to the inventory.'}
            </p>
            <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Asset Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {editingAsset ? 'Update the details of the existing asset.' : 'Enter the details for the new hardware asset.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Asset Name *</Label>
                    <Input
                        id="name"
                        required
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Finance Laptop 01"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="assetTag">Asset Tag *</Label>
                    <Input
                        id="assetTag"
                        required
                        value={formData.assetTag || ''}
                        onChange={e => setFormData({...formData, assetTag: e.target.value})}
                        placeholder="TAG-0001"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select value={formData.type} onValueChange={(val: any) => setFormData({...formData, type: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="laptop">Laptop</SelectItem>
                            <SelectItem value="desktop">Desktop</SelectItem>
                            <SelectItem value="server">Server</SelectItem>
                            <SelectItem value="network_device">Network Device</SelectItem>
                            <SelectItem value="printer">Printer</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                            <SelectItem value="peripheral">Peripheral</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(val: any) => setFormData({...formData, status: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="broken">Broken</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                        id="manufacturer"
                        value={formData.manufacturer || ''}
                        onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                        placeholder="Dell, HP, Apple..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                        id="model"
                        value={formData.model || ''}
                        onChange={e => setFormData({...formData, model: e.target.value})}
                        placeholder="Latitude 7420"
                    />
                </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                        id="serialNumber"
                        value={formData.serialNumber || ''}
                        onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                        placeholder="SN-123456789"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ipAddress">IP Address</Label>
                    <Input
                        id="ipAddress"
                        value={formData.ipAddress || ''}
                        onChange={e => setFormData({...formData, ipAddress: e.target.value})}
                        placeholder="192.168.1.X"
                    />
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Asset</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

