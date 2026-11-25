import ArtworkCard from './ArtworkCard';
import { ImageOff } from 'lucide-react';

// GRID GALERI: menyusun kartu karya dan menampilkan keadaan kosong jika belum ada hasil.
export default function ArtworkGrid({ items, user, empty = 'No artworks found yet.' }) {
    if (!items?.length)
        return <div className="empty"><ImageOff className="mx-auto mb-3" size={30}/><h3 className="font-bold text-lg">Nothing here yet</h3><p className="text-sm mt-2">{empty}</p></div>;
    return <div className="art-grid">{items.map(art => <ArtworkCard key={art.id} art={art} user={user}/>)}</div>;
}

