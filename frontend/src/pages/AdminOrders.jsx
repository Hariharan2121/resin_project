import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Search, 
  Filter, 
  User, 
  Mail, 
  IndianRupee, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getAllOrdersAdmin();
      setOrders(response.data.data);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusAdmin(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm);
    
    const matchesFilter = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':   return 'bg-[#FEF0E3] text-[#C87941] border-[#EDD9C0]';
      case 'confirmed': return 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]';
      case 'completed': return 'bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]';
      case 'cancelled': return 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]';
      default:          return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':   return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <Truck className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default:          return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5EE] py-12 px-4 sm:px-10 font-dm-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#9C7B65] text-xs font-semibold tracking-widest uppercase">Management</span>
              <div className="h-[1px] w-8 bg-[#DEC5A8]"></div>
            </div>
            <h1 className="font-playfair text-4xl font-bold text-[#2C1810]">Order Dashboard</h1>
            <p className="text-[#9C7B65] mt-2 italic">View and manage all customer requests in one place</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C7B65]" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-[#EDD9C0] rounded-xl text-sm focus:outline-none focus:border-[#C87941] w-full sm:w-[250px] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 bg-white border border-[#EDD9C0] rounded-xl px-3 py-1.5 focus-within:border-[#C87941]">
              <Filter className="w-4 h-4 text-[#9C7B65]" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer text-[#5C3D2A] font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-10 h-10 border-4 border-[#EDD9C0] border-t-[#C87941] rounded-full animate-spin mb-4"></div>
            <p className="text-[#9C7B65] animate-pulse">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-[#EDD9C0] rounded-3xl p-20 text-center shadow-sm">
            <div className="bg-[#FBF5EE] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-[#DEC5A8]" />
            </div>
            <h3 className="text-xl font-playfair font-bold text-[#2C1810] mb-2">No orders found</h3>
            <p className="text-[#9C7B65] max-w-xs mx-auto mb-8">
              {searchTerm || statusFilter !== 'all' 
                ? "We couldn't find any orders matching your current filters." 
                : "Your shop hasn't received any orders yet. Once orders are placed, they will appear here."}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button 
                onClick={() => {setSearchTerm(''); setStatusFilter('all');}}
                className="text-[#C87941] font-semibold border-b border-[#C87941] hover:text-[#8B4513] hover:border-[#8B4513] transition-all"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map(order => (
              <div 
                key={order.id} 
                className="bg-white border border-[#EDD9C0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center">
                  {/* Order Info Section */}
                  <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-[#EDD9C0]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[0.7rem] font-bold text-[#9C7B65] uppercase tracking-wider">
                        Order #{order.id.slice(-6).toUpperCase()}
                        {order.orderType === 'custom' && (
                          <span className="ml-2 bg-[#FEF0E3] text-[#C87941] px-2 py-0.5 rounded-full text-[0.65rem]">Custom</span>
                        )}
                      </span>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-tighter`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FBF5EE] flex items-center justify-center border border-[#EDD9C0]">
                          <User className="w-5 h-5 text-[#9C7B65]" />
                        </div>
                        <div>
                          <div className="text-[0.9rem] font-bold text-[#2C1810]">{order.userName}</div>
                          <div className="text-xs text-[#9C7B65] flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {order.userEmail}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-[#9C7B65]">Receipt Total</span>
                        <div className="flex items-center text-[#C87941] font-bold text-lg">
                          <IndianRupee className="w-4 h-4" />
                          {order.totalPrice.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="text-[0.7rem] text-[#9C7B65] flex items-center justify-between">
                      <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Order Contents Section */}
                  <div className="p-6 lg:flex-1 bg-[#FBF5EE]/30">
                    <h4 className="text-[0.7rem] font-bold text-[#9C7B65] uppercase tracking-widest mb-4">Package Contents</h4>
                    
                    {order.orderType === 'standard' ? (
                      <div className="space-y-4 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-[#FEF0E3] text-[#C87941] text-[0.7rem] font-bold flex items-center justify-center">
                                x{item.quantity}
                              </div>
                              <span className="text-[#5C3D2A] font-medium">{item.name}</span>
                            </div>
                            <span className="flex items-center text-[#7A5542] text-xs">
                              <IndianRupee className="w-3 h-3" />
                              {(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-white p-2.5 rounded-xl border border-[#EDD9C0]">
                          <div className="text-[0.65rem] text-[#9C7B65] mb-1">Product Type</div>
                          <div className="text-xs font-bold text-[#2C1810]">{order.customDetails.productType}</div>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#EDD9C0]">
                          <div className="text-[0.65rem] text-[#9C7B65] mb-1">Base Color</div>
                          <div className="text-xs font-bold text-[#2C1810]" style={{ color: order.customDetails.textColor }}>{order.customDetails.baseColor}</div>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#EDD9C0]">
                          <div className="text-[0.65rem] text-[#9C7B65] mb-1">Shape / Size</div>
                          <div className="text-xs font-bold text-[#2C1810]">{order.customDetails.shape} · {order.customDetails.size}</div>
                        </div>
                        <div className="col-span-2 md:col-span-3 bg-white p-2.5 rounded-xl border border-[#EDD9C0]">
                          <div className="text-[0.65rem] text-[#9C7B65] mb-1 text-center">Inclusions</div>
                          <div className="text-xs font-medium text-[#5C3D2A] text-center">{order.customDetails.inclusions}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="p-6 lg:w-[220px] flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-[#EDD9C0]">
                    <div className="text-[0.65rem] font-bold text-[#9C7B65] uppercase tracking-widest text-center mb-1">Update Status</div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                        disabled={order.status === 'confirmed'}
                        className={`py-2 rounded-lg text-[0.65rem] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 ${
                          order.status === 'confirmed' ? 'bg-[#E8F5E9] text-[#2E7D32] opacity-50' : 'bg-white border border-[#EDD9C0] hover:border-[#2E7D32] hover:text-[#2E7D32]'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleStatusChange(order.id, 'completed')}
                        disabled={order.status === 'completed'}
                        className={`py-2 rounded-lg text-[0.65rem] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 ${
                          order.status === 'completed' ? 'bg-[#E3F2FD] text-[#1976D2] opacity-50' : 'bg-white border border-[#EDD9C0] hover:border-[#1976D2] hover:text-[#1976D2]'
                        }`}
                      >
                        <Truck className="w-3 h-3" />
                        Ship
                      </button>
                    </div>

                    {order.status !== 'cancelled' ? (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        className="w-full py-2 bg-white border border-[#FFCDD2] text-[#C62828] rounded-lg text-[0.65rem] font-bold uppercase hover:bg-[#FFEBEE] transition-all"
                      >
                        Cancel Order
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'pending')}
                        className="w-full py-2 bg-white border border-[#EDD9C0] text-[#C87941] rounded-lg text-[0.65rem] font-bold uppercase hover:bg-[#FEF0E3] transition-all"
                      >
                        Re-open
                      </button>
                    )}
                    
                    <button className="w-full mt-2 flex items-center justify-center gap-2 text-[0.7rem] font-semibold text-[#9C7B65] hover:text-[#C87941] transition-colors">
                      View full details <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #FBF5EE;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #DEC5A8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C87941;
        }
      `}} />
    </div>
  );
};

export default AdminOrders;
