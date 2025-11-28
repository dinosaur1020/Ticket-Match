import React, { useEffect, useState } from 'react';
import api from '../api';
import { Ticket as TicketIcon, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Ticket {
  ticket_id: string;
  seat_area: string;
  seat_number: string;
  price: string;
  status: string;
}

interface TradeHistoryItem {
  trade_id: string;
  role: string;
  status: string;
  created_at: string;
}

interface TradeDetails {
    trade_id: string;
    participants: { user_id: string, confirmed: boolean }[];
}

const DashboardPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [trades, setTrades] = useState<TradeHistoryItem[]>([]);
  const [activeTradeDetails, setActiveTradeDetails] = useState<Record<string, TradeDetails>>({});
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user) {
        window.location.href = '/login';
        return;
    }

    const fetchData = async () => {
      try {
        const ticketRes = await api.get(`/tickets/user/${user.user_id}`);
        setTickets(ticketRes.data);

        const tradeRes = await api.get(`/trades/user/${user.user_id}`);
        setTrades(tradeRes.data);
        
        // Fetch details for pending trades to check confirmation status
        const pendingTrades = tradeRes.data.filter((t: any) => t.status === 'Pending');
        for (const t of pendingTrades) {
            const detailRes = await api.get(`/trades/${t.trade_id}`);
            setActiveTradeDetails(prev => ({...prev, [t.trade_id]: detailRes.data}));
        }

      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user]);

  const handleConfirm = async (tradeId: string) => {
      try {
          await api.post(`/trades/${tradeId}/confirm`, { user_id: user.user_id });
          alert("Confirmed!");
          window.location.reload();
      } catch (err) {
          console.error(err);
          alert("Failed to confirm");
      }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">My Tickets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <div key={ticket.ticket_id} className="border rounded p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                 <span className={`text-xs px-2 py-1 rounded-full ${ticket.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                     {ticket.status}
                 </span>
              </div>
              <div className="flex items-center mb-2 text-blue-600">
                  <TicketIcon className="h-5 w-5 mr-2" />
                  <span className="font-mono font-bold">{ticket.ticket_id}</span>
              </div>
              <p className="text-gray-600">Seat: {ticket.seat_area} - {ticket.seat_number}</p>
              <p className="font-semibold mt-2">${ticket.price}</p>
            </div>
          ))}
          {tickets.length === 0 && <p className="text-gray-500">No tickets found.</p>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Trade History</h2>
        <div className="space-y-4">
          {trades.map(trade => {
            const isPending = trade.status === 'Pending';
            const details = activeTradeDetails[trade.trade_id];
            const myConfirmation = details?.participants.find(p => p.user_id === user.user_id)?.confirmed;
            
            return (
              <div key={trade.trade_id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold">{trade.trade_id}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                        trade.status === 'Completed' ? 'bg-green-50 border-green-200 text-green-700' :
                        trade.status === 'Pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-gray-50 text-gray-700'
                    }`}>
                        {trade.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Role: {trade.role} • {new Date(trade.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                    {isPending && (
                        <div className="text-right mr-4">
                            {myConfirmation ? (
                                <span className="flex items-center text-green-600 text-sm">
                                    <CheckCircle className="h-4 w-4 mr-1" /> You Confirmed
                                </span>
                            ) : (
                                <button 
                                    onClick={() => handleConfirm(trade.trade_id)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-semibold"
                                >
                                    Confirm Trade
                                </button>
                            )}
                        </div>
                    )}
                    
                    {trade.status === 'Completed' && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                    {trade.status === 'Canceled' && (
                        <XCircle className="h-6 w-6 text-red-500" />
                    )}
                </div>
              </div>
            );
          })}
          {trades.length === 0 && <p className="text-gray-500">No trade history.</p>}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
