import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { Calendar, User } from 'lucide-react';

interface Listing {
  listing_id: string;
  event_date: string;
  status: string;
  content: string;
  type: string;
  owner_id: string;
}

interface EventDetails {
  event_id: string;
  event_name: string;
  venue: string;
  times: { event_time: string }[];
  performers: { performer: string }[];
}

const EventPage = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchData = async () => {
        if (!id) return;
      try {
        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data);

        const listingsRes = await api.get(`/listings?event_id=${id}`);
        setListings(listingsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleTrade = async (listingId: string, ownerId: string) => {
      if (!user) {
          alert("Please login to trade");
          return;
      }
      if (user.user_id === ownerId) {
          alert("You cannot trade with yourself");
          return;
      }
      
      try {
          // 1. Get tickets for this listing
          const ticketRes = await api.get(`/tickets/listing/${listingId}`);
          const tickets = ticketRes.data;
          
          if (tickets.length === 0) {
              alert("No tickets found for this listing");
              return;
          }

          const ticketIds = tickets.map((t: any) => t.ticket_id);

          // 2. Create Trade
          const tradeId = `trade-${Date.now()}`;
          await api.post('/trades', {
              trade_id: tradeId,
              listing_id: listingId,
              buyer_id: user.user_id,
              seller_id: ownerId,
              ticket_ids: ticketIds
          });
          alert("Trade request sent! Go to Dashboard to confirm.");
      } catch (err) {
          console.error(err);
          alert("Failed to start trade");
      }
  };

  if (loading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{event.event_name}</h1>
        <p className="text-xl text-gray-600 mb-4">{event.venue}</p>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Performers:</h3>
          <div className="flex gap-2">
            {event.performers.map(p => (
              <span key={p.performer} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {p.performer}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
            <h3 className="font-semibold mb-2">Times:</h3>
            <ul className="list-disc list-inside">
                {event.times.map((t, i) => (
                    <li key={i}>{new Date(t.event_time).toLocaleString()}</li>
                ))}
            </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Active Listings</h2>
      {listings.length === 0 ? (
        <p>No active listings for this event.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <div key={listing.listing_id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                    listing.type === 'Sale' ? 'bg-green-100 text-green-800' :
                    listing.type === 'Trade' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {listing.type}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">#{listing.listing_id}</span>
                </div>

                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{listing.content}</h3>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{new Date(listing.event_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Seller: {listing.owner_id}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-center">
                <button
                  onClick={() => handleTrade(listing.listing_id, listing.owner_id)}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-medium"
                >
                  Trade
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventPage;
