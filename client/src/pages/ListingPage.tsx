import { useEffect, useState } from 'react';
import api from '../api';
import { Calendar, User, Ticket, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import ListingModal from '../components/ListingModal';

interface Listing {
  listing_id: string;
  event_id: string;
  event_date: string;
  status: string;
  content: string;
  type: string;
  owner_id: string;
}

interface ListingDetails {
  listing: Listing;
  event: {
    event_id: string;
    event_name: string;
    venue: string;
  };
  times: { event_time: string }[];
  performers: { performer: string }[];
  tickets: {
    ticket_id: string;
    seat_area: string;
    seat_number: string;
    price: number | null;
    status: string;
  }[];
  seller: {
    user_id: string;
    user_name: string;
    email: string;
  };
}

const ListingPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingDetails | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Fetch all listings (without event_id param to get all)
        const res = await api.get('/listings');
        setListings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filteredListings = filter === 'All'
    ? listings
    : listings.filter(l => l.type === filter);

  const openListingDetails = async (listingId: string) => {
    setModalOpen(true);

    try {
      const res = await api.get(`/listings/${listingId}`);
      setSelectedListing(res.data);
    } catch (err) {
      console.error('Failed to fetch listing details:', err);
      alert('Failed to load listing details');
      setModalOpen(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedListing(null);
  };

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading listings...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Active Listings</h1>
        
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <Filter className="h-4 w-4 ml-2 text-gray-500" />
          {['All', 'Sale', 'Trade', 'Wanted'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === type 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
          <Ticket className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No listings found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
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
              
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                 <Link 
                    to={`/events/${listing.event_id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                 >
                    View Event
                 </Link>
                 <button
                    onClick={() => openListingDetails(listing.listing_id)}
                    className="text-sm font-medium bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 transition-colors"
                 >
                    Details
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ListingModal
        listing={selectedListing}
        isOpen={modalOpen}
        onClose={closeModal}
        user={user}
      />
    </div>
  );
};

export default ListingPage;
