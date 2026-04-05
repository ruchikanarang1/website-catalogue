import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, ChevronDown, ChevronUp, Filter, Loader2, ShoppingBag } from 'lucide-react';

export default function OrderHistory() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const orange = '#FF6A00';
  const navy = '#0f172a';
  const ORDERS_PER_PAGE = 20;

  useEffect(() => {
    if (profile) {
      loadOrders();
    }
  }, [profile, statusFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setOrders(data || []);
      setHasMore(count > page * ORDERS_PER_PAGE);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '80px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '4rem 2rem'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: `${orange}15`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <ShoppingBag size={40} color={orange} />
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: navy,
            margin: '0 0 0.5rem'
          }}>
            Order History
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#64748b',
            margin: 0
          }}>
            View and track your past orders
          </p>
        </div>

        {/* Status Filter */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <Filter size={18} />
            Filter:
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {['all', 'pending', 'processing', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1.5px solid ${statusFilter === status ? orange : '#e2e8f0'}`,
                  background: statusFilter === status ? orange : 'white',
                  color: statusFilter === status ? 'white' : '#64748b',
                  transition: 'all 0.15s',
                  textTransform: 'capitalize'
                }}
              >
                {status === 'all' ? 'All Orders' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#94a3b8'
          }}>
            <Loader2
              size={32}
              style={{
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
              }}
            />
            <p>Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '6rem 2rem',
            color: '#94a3b8',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <Package size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <h3 style={{ color: '#64748b', margin: '0 0 0.5rem' }}>No orders found</h3>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              {statusFilter !== 'all'
                ? `No ${statusFilter} orders yet`
                : 'You haven\'t placed any orders yet'}
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s'
                  }}
                >
                  {/* Order Header */}
                  <div
                    onClick={() => toggleOrderDetails(order.id)}
                    style={{
                      padding: '1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: navy
                        }}>
                          Order #{order.id.slice(0, 8)}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status)
                        }}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#64748b'
                      }}>
                        {formatDate(order.created_at)}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem'
                    }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          marginBottom: '0.25rem'
                        }}>
                          Total
                        </div>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: orange
                        }}>
                          {order.total_amount > 0
                            ? `₹${order.total_amount.toLocaleString('en-IN')}`
                            : 'Quote Based'}
                        </div>
                      </div>

                      <div style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: navy }}>
                          {order.items?.length || 0}
                        </div>
                        items
                      </div>

                      {selectedOrder === order.id ? (
                        <ChevronUp size={20} color={orange} />
                      ) : (
                        <ChevronDown size={20} color="#94a3b8" />
                      )}
                    </div>
                  </div>

                  {/* Order Details (Expanded) */}
                  {selectedOrder === order.id && (
                    <div style={{
                      borderTop: '1px solid #e2e8f0',
                      padding: '1.5rem',
                      background: '#f8fafc'
                    }}>
                      {/* Customer Info */}
                      <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h4 style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: navy,
                          margin: '0 0 0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Delivery Information
                        </h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '0.75rem',
                          fontSize: '0.85rem'
                        }}>
                          <div>
                            <span style={{ color: '#94a3b8' }}>Name: </span>
                            <span style={{ color: navy, fontWeight: 600 }}>
                              {order.customer_name}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#94a3b8' }}>Phone: </span>
                            <span style={{ color: navy, fontWeight: 600 }}>
                              {order.customer_phone}
                            </span>
                          </div>
                          {order.customer_email && (
                            <div>
                              <span style={{ color: '#94a3b8' }}>Email: </span>
                              <span style={{ color: navy, fontWeight: 600 }}>
                                {order.customer_email}
                              </span>
                            </div>
                          )}
                          {order.customer_address && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <span style={{ color: '#94a3b8' }}>Address: </span>
                              <span style={{ color: navy, fontWeight: 600 }}>
                                {order.customer_address}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <h4 style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: navy,
                        margin: '0 0 0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Order Items
                      </h4>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '1rem',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              gap: '1rem'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: navy,
                                marginBottom: '0.25rem'
                              }}>
                                {item.product_name}
                              </div>
                              {item.category && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#94a3b8'
                                }}>
                                  {item.category}
                                </div>
                              )}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem'
                            }}>
                              <div style={{
                                fontSize: '0.85rem',
                                color: '#64748b'
                              }}>
                                Qty: <span style={{ fontWeight: 700, color: navy }}>
                                  {item.quantity}
                                </span>
                              </div>
                              <div style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: orange
                              }}>
                                {item.unit_price > 0
                                  ? `₹${item.unit_price.toLocaleString('en-IN')}`
                                  : 'Quote'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <h4 style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: navy,
                            margin: '0 0 0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Notes
                          </h4>
                          <p style={{
                            fontSize: '0.85rem',
                            color: '#64748b',
                            margin: 0,
                            lineHeight: 1.6
                          }}>
                            {order.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {hasMore && (
              <div style={{
                textAlign: 'center',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    background: orange,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem 2rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Load More Orders
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
