"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Building2, Table, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Função para obter role do usuário via API
const getUserRole = async () => {
  try {
    const response = await fetch('/api/auth/me');
    
    if (!response.ok) {
      return null;
    }
    
    const userData = await response.json();
    
    if (!userData.id || !userData.role) {
      return null;
    }
    
    const normalizedRole = userData.role ? userData.role.toUpperCase() : '';
    return normalizedRole;
  } catch (error) {
    console.error('❌ Erro ao obter dados do usuário:', error);
    return null;
  }
};

interface Area {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  tables: Table[];
}

interface Table {
  id: string;
  number: string;
  name: string;
  capacity: number;
  areaId: string;
  isActive: boolean;
  status: 'available' | 'occupied' | 'reserved';
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  menuItem: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  tableId?: string;
  areaId?: string;
  totalAmount: number;
  orderItems: OrderItem[];
  createdAt: string;
  customerName?: string;
  notes?: string;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showEditAreaModal, setShowEditAreaModal] = useState(false);
  const [showEditTableModal, setShowEditTableModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableDetailsModal, setShowTableDetailsModal] = useState(false);
  const [areaForm, setAreaForm] = useState({ name: "", description: "" });
  const [tableForm, setTableForm] = useState({ name: "", capacity: 4 });
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showDeleteAreaDialog, setShowDeleteAreaDialog] = useState(false);
  const [showDeleteTableDialog, setShowDeleteTableDialog] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

  // Carregar áreas e mesas
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar role do usuário
        const currentUserRole = await getUserRole();
        setUserRole(currentUserRole);
        setIsRoleLoaded(true);
        
        await Promise.all([fetchAreas(), fetchOrders()]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    fetchData();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await fetch('/api/areas');
      if (response.ok) {
        const data = await response.json();
        setAreas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar áreas:', error);
      toast.error('Erro ao carregar áreas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    }
  };

  const handleCreateArea = async () => {
    if (!areaForm.name.trim()) {
      toast.error('Nome da área é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(areaForm),
      });

      if (response.ok) {
        toast.success('Área criada com sucesso!');
        setAreaForm({ name: '', description: '' });
        setShowAreaModal(false);
        fetchAreas();
      } else {
        toast.error('Erro ao criar área');
      }
    } catch (error) {
      console.error('Erro ao criar área:', error);
      toast.error('Erro ao criar área');
    }
  };

  const handleCreateTable = async () => {
    if (!tableForm.name.trim() || !selectedArea) {
      toast.error('Nome da mesa e área são obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tableForm,
          areaId: selectedArea.id,
          number: `${selectedArea.name}-${tableForm.name}`,
        }),
      });

      if (response.ok) {
        toast.success('Mesa criada com sucesso!');
        setTableForm({ name: '', capacity: 4 });
        setShowTableModal(false);
        fetchAreas();
      } else {
        toast.error('Erro ao criar mesa');
      }
    } catch (error) {
      console.error('Erro ao criar mesa:', error);
      toast.error('Erro ao criar mesa');
    }
  };

  const handleEditArea = async () => {
    if (!areaForm.name.trim() || !selectedArea) {
      toast.error('Nome da área é obrigatório');
      return;
    }

    try {
      const response = await fetch(`/api/areas/${selectedArea.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(areaForm),
      });

      if (response.ok) {
        toast.success('Área atualizada com sucesso!');
        setAreaForm({ name: '', description: '' });
        setShowEditAreaModal(false);
        setSelectedArea(null);
        fetchAreas();
      } else {
        toast.error('Erro ao atualizar área');
      }
    } catch (error) {
      console.error('Erro ao atualizar área:', error);
      toast.error('Erro ao atualizar área');
    }
  };

  const handleEditTable = async () => {
    if (!tableForm.name.trim() || !selectedTable) {
      toast.error('Nome da mesa é obrigatório');
      return;
    }

    try {
      const response = await fetch(`/api/tables/${selectedTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableForm),
      });

      if (response.ok) {
        toast.success('Mesa atualizada com sucesso!');
        setTableForm({ name: '', capacity: 4 });
        setShowEditTableModal(false);
        setSelectedTable(null);
        fetchAreas();
      } else {
        toast.error('Erro ao atualizar mesa');
      }
    } catch (error) {
      console.error('Erro ao atualizar mesa:', error);
      toast.error('Erro ao atualizar mesa');
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    setAreaToDelete(areaId);
    setShowDeleteAreaDialog(true);
  };

  const confirmDeleteArea = async () => {
    if (!areaToDelete) return;

    try {
      const response = await fetch(`/api/areas/${areaToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Área excluída com sucesso!');
        fetchAreas();
      } else {
        toast.error('Erro ao excluir área');
      }
    } catch (error) {
      console.error('Erro ao excluir área:', error);
      toast.error('Erro ao excluir área');
    } finally {
      setShowDeleteAreaDialog(false);
      setAreaToDelete(null);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    setTableToDelete(tableId);
    setShowDeleteTableDialog(true);
  };

  const confirmDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      const response = await fetch(`/api/tables/${tableToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Mesa excluída com sucesso!');
        fetchAreas();
      } else {
        toast.error('Erro ao excluir mesa');
      }
    } catch (error) {
      console.error('Erro ao excluir mesa:', error);
      toast.error('Erro ao excluir mesa');
    } finally {
      setShowDeleteTableDialog(false);
      setTableToDelete(null);
    }
  };

  const getTableStatus = (table: Table) => {
    // Filtrar pedidos que estão ativos (não entregues nem cancelados)
    const activeOrders = orders.filter(order => 
      order.status !== 'DELIVERED' && 
      order.status !== 'CANCELLED'
    );
    
    // Verificar se há pedidos ativos para esta mesa específica usando tableId
    const tableOrders = activeOrders.filter(order => 
      order.tableId === table.id
    );
    

    
    if (tableOrders.length > 0) {
      return { 
        status: 'occupied', 
        label: 'Ocupado', 
        color: 'bg-red-100 text-red-800',
        orderCount: tableOrders.length,
        orders: tableOrders
      };
    }
    return { 
      status: 'available', 
      label: 'Livre', 
      color: 'bg-green-100 text-green-800',
      orderCount: 0,
      orders: []
    };
  };

  const handleTableClick = (table: Table) => {
    const status = getTableStatus(table);
    
    if (status.status === 'occupied') {
      setSelectedTable(table);
      setShowTableDetailsModal(true);
    } else {
             toast.info(`${table.name || 'Mesa'} está livre`);
    }
  };

  return (
    <div className="wrapper">
             <div className="flex justify-between items-center mb-6">
         <div>
           <h1 className="text-2xl font-bold text-gray-900">Áreas e Mesas</h1>
           <p className="text-gray-600">
             Gerencie as áreas e mesas do seu restaurante
           </p>
         </div>
       </div>

                    <div className="space-y-6">
         {/* Cabeçalho */}
         <Card>
           <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle className="flex items-center gap-2">
               <Building2 className="h-5 w-5 text-orange-600" />
               Áreas do Restaurante
             </CardTitle>
             {isRoleLoaded && userRole !== 'OPERATOR' && (
               <Button onClick={() => setShowAreaModal(true)}>
                 <Plus className="h-4 w-4 mr-2" />
                 Nova Área
               </Button>
             )}
           </CardHeader>
         </Card>

          {/* Lista de Áreas */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-12 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : areas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma área criada</h3>
                <p className="text-gray-500 mb-4">Crie sua primeira área para começar a organizar as mesas</p>
                {isRoleLoaded && userRole !== 'OPERATOR' && (
                  <Button onClick={() => setShowAreaModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Área
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {areas.map((area) => (
                <Card key={area.id} className="hover:shadow-lg transition-shadow">
                                     <CardHeader>
                     <div className="flex items-center justify-between">
                       <CardTitle className="text-lg">{area.name}</CardTitle>
                       <div className="flex items-center gap-2">
                         <Badge variant="secondary">{area.tables?.length || 0} mesas</Badge>
                         {isRoleLoaded && userRole !== 'OPERATOR' && (
                           <div className="flex gap-1">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => {
                                 setAreaForm({ name: area.name, description: area.description });
                                 setSelectedArea(area);
                                 setShowEditAreaModal(true);
                               }}
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleDeleteArea(area.id)}
                               className="text-red-600 hover:text-red-700 hover:bg-red-50"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                         )}
                       </div>
                     </div>
                     <p className="text-sm text-gray-600">{area.description}</p>
                   </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {area.tables && area.tables.length > 0 ? (
                        area.tables.map((table) => {
                          const status = getTableStatus(table);
                          return (
                            <div
                              key={table.id}
                              onClick={() => handleTableClick(table)}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                                status.status === 'occupied' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                              }`}
                            >
                                                             <div className="flex items-center justify-between">
                                 <div>
                                                                       <h4 className="font-medium">{table.name || 'Mesa sem nome'}</h4>
                                                                       <p className="text-sm text-gray-600">Capacidade: {table.capacity || 0}</p>
                                   {status.orderCount > 0 && (
                                     <p className="text-xs text-red-600 font-medium">
                                       {status.orderCount} pedido(s) ativo(s)
                                     </p>
                                   )}
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <Badge className={status.color}>{status.label}</Badge>
                                   {isRoleLoaded && userRole !== 'OPERATOR' && (
                                     <div className="flex gap-1">
                                       <Button
                                         variant="ghost"
                                         size="sm"
                                         onClick={() => {
                                           setTableForm({ name: table.name, capacity: table.capacity });
                                           setSelectedTable(table);
                                           setShowEditTableModal(true);
                                         }}
                                       >
                                         <Edit className="h-3 w-3" />
                                       </Button>
                                       <Button
                                         variant="ghost"
                                         size="sm"
                                         onClick={() => handleDeleteTable(table.id)}
                                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                       >
                                         <Trash2 className="h-3 w-3" />
                                       </Button>
                                     </div>
                                   )}
                                 </div>
                               </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Table className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Nenhuma mesa</p>
                        </div>
                      )}
                      
                      {isRoleLoaded && userRole !== 'OPERATOR' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedArea(area);
                            setShowTableModal(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Mesa
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      



                           {/* Modal de Nova Área */}
        <Dialog open={showAreaModal} onOpenChange={setShowAreaModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                Nova Área
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="areaName">Nome da Área *</Label>
                <Input
                  id="areaName"
                  value={areaForm.name}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Área Principal"
                  className="focus:border-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="areaDescription">Descrição</Label>
                <Input
                  id="areaDescription"
                  value={areaForm.description}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Sala principal do restaurante"
                  className="focus:border-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAreaModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateArea} className="bg-orange-500 hover:bg-orange-600">
                  Criar Área
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

       {/* Modal de Editar Área */}
       <Dialog open={showEditAreaModal} onOpenChange={setShowEditAreaModal}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Edit className="h-5 w-5 text-orange-600" />
               Editar Área
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label htmlFor="editAreaName">Nome da Área *</Label>
               <Input
                 id="editAreaName"
                 value={areaForm.name}
                 onChange={(e) => setAreaForm(prev => ({ ...prev, name: e.target.value }))}
                 placeholder="Ex: Área Principal"
                 className="focus:border-orange-500"
               />
             </div>
             <div>
               <Label htmlFor="editAreaDescription">Descrição</Label>
               <Input
                 id="editAreaDescription"
                 value={areaForm.description}
                 onChange={(e) => setAreaForm(prev => ({ ...prev, description: e.target.value }))}
                 placeholder="Ex: Sala principal do restaurante"
                 className="focus:border-orange-500"
               />
             </div>
             <div className="flex justify-end gap-2 pt-2">
               <Button variant="outline" onClick={() => setShowEditAreaModal(false)}>
                 Cancelar
               </Button>
               <Button onClick={handleEditArea} className="bg-orange-500 hover:bg-orange-600">
                 Atualizar Área
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       

      {/* Modal de Nova Mesa */}
      <Dialog open={showTableModal} onOpenChange={setShowTableModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Table className="h-5 w-5 text-orange-600" />
              Nova Mesa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tableName">Nome da Mesa *</Label>
              <Input
                id="tableName"
                value={tableForm.name}
                onChange={(e) => setTableForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Mesa 1"
                className="focus:border-orange-500"
              />
            </div>
            <div>
              <Label htmlFor="tableCapacity">Capacidade *</Label>
              <Input
                id="tableCapacity"
                type="number"
                min="1"
                max="20"
                value={tableForm.capacity}
                onChange={(e) => setTableForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 4 }))}
                className="focus:border-orange-500"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Área selecionada:</strong> {selectedArea?.name}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowTableModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTable} className="bg-orange-500 hover:bg-orange-600">
                Criar Mesa
              </Button>
            </div>
          </div>
                 </DialogContent>
       </Dialog>

       {/* Modal de Editar Mesa */}
       <Dialog open={showEditTableModal} onOpenChange={setShowEditTableModal}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Edit className="h-5 w-5 text-orange-600" />
               Editar Mesa
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label htmlFor="editTableName">Nome da Mesa *</Label>
               <Input
                 id="editTableName"
                 value={tableForm.name}
                 onChange={(e) => setTableForm(prev => ({ ...prev, name: e.target.value }))}
                 placeholder="Ex: Mesa 1"
                 className="focus:border-orange-500"
               />
             </div>
             <div>
               <Label htmlFor="editTableCapacity">Capacidade *</Label>
               <Input
                 id="editTableCapacity"
                 type="number"
                 min="1"
                 max="20"
                 value={tableForm.capacity}
                 onChange={(e) => setTableForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 4 }))}
                 className="focus:border-orange-500"
               />
             </div>
             <div className="bg-blue-50 p-3 rounded-lg">
               <p className="text-sm text-blue-700">
                 <strong>Área:</strong> {selectedTable?.areaId ? areas.find(a => a.id === selectedTable.areaId)?.name : 'N/A'}
               </p>
             </div>
             <div className="flex justify-end gap-2 pt-2">
               <Button variant="outline" onClick={() => setShowEditTableModal(false)}>
                 Cancelar
               </Button>
               <Button onClick={handleEditTable} className="bg-orange-500 hover:bg-orange-600">
                 Atualizar Mesa
               </Button>
             </div>
           </div>
         </DialogContent>
               </Dialog>

        {/* Modal de Detalhes da Mesa */}
        <Dialog open={showTableDetailsModal} onOpenChange={setShowTableDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto pr-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Table className="h-5 w-5 text-orange-600" />
                                 Detalhes da Mesa: {selectedTable?.name || 'N/A'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {selectedTable && (() => {
                const status = getTableStatus(selectedTable);
                if (status.status === 'occupied' && status.orders.length > 0) {
                  return (
                    <div className="space-y-4">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h3 className="font-medium text-red-900 mb-2">
                          Mesa Ocupada - {status.orderCount} Pedido(s) Ativo(s)
                        </h3>
                        <p className="text-red-700 text-sm">
                          Esta mesa possui pedidos em andamento
                        </p>
                      </div>
                      
                                             {status.orders.map((order) => (
                           <Card key={order.id} className="border-orange-200">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                                                 <h4 className="font-medium">Pedido #{order.orderNumber || 'N/A'}</h4>
                                                                 <p className="text-sm text-gray-600">
                                   Status: <Badge variant="outline">{order.status || 'N/A'}</Badge>
                                 </p>
                                <p className="text-sm text-gray-600">
                                  Cliente: {order.customerName || 'Não informado'}
                                </p>
                                                                 {order.notes && (
                                   <p className="text-sm text-gray-600">
                                     Observações: {order.notes || ''}
                                   </p>
                                 )}
                              </div>
                                                             <div className="text-right">
                                 <p className="text-lg font-bold text-orange-600">
                                   Total: R${(order.totalAmount || 0).toFixed(2)}
                                 </p>
                                 <p className="text-sm text-gray-500">
                                   {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                                 </p>
                               </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <h5 className="font-medium text-gray-900">Itens do Pedido:</h5>
                              {order.orderItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                                                         {item.menuItem?.image ? (
                                       <img 
                                         src={item.menuItem.image} 
                                         alt={item.menuItem.name || 'Produto'}
                                         className="w-12 h-12 object-cover rounded-md"
                                       />
                                     ) : (
                                       <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                         <span className="text-xs text-gray-500">IMG</span>
                                       </div>
                                     )}
                                    <div>
                                      <p className="font-medium">{item.menuItem?.name || 'Nome não disponível'}</p>
                                                                           <p className="text-sm text-gray-600">
                                       Quantidade: {item.quantity || 0}
                                     </p>
                                    </div>
                                  </div>
                                                                     <div className="text-right">
                                     <p className="font-medium text-gray-900">
                                       R${(item.unitPrice || 0).toFixed(2)}
                                     </p>
                                     <p className="text-sm text-gray-600">
                                                                               R${((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}
                                     </p>
                                   </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                       ))}
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-8">
                      <Table className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Mesa Livre</h3>
                      <p className="text-gray-500">Esta mesa não possui pedidos ativos</p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </DialogContent>
        </Dialog>

        {/* Alert Dialog para deletar área */}
        <AlertDialog open={showDeleteAreaDialog} onOpenChange={setShowDeleteAreaDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta área? Todas as mesas associadas serão removidas.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteArea} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Alert Dialog para deletar mesa */}
        <AlertDialog open={showDeleteTableDialog} onOpenChange={setShowDeleteTableDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta mesa? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteTable} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
