import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Calendar, User, Tag } from 'lucide-react';

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
      <div className="space-y-4">
        {listings.length === 0 ? (
            <p>No active listings for this event.</p>
        ) : (
            listings.map(listing => (
            <div key={listing.listing_id} className="bg-white p-6 rounded-lg shadow border border-gray-200 flex justify-between items-center">
                <div>
                <div className="flex items-center text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(listing.event_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-500 mb-2">
                    <User className="h-4 w-4 mr-2" />
                    <span>User: {listing.owner_id}</span>
                </div>
                <div className="flex items-center text-gray-500">
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="capitalize">{listing.type}</span>
                </div>
                <p className="mt-2 text-gray-700">{listing.content}</p>
                </div>
                
                <button 
                    onClick={() => handleTrade(listing.listing_id, listing.owner_id)}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                >
                    Trade
                </button>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default EventPage;
