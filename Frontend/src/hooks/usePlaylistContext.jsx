import { useContext } from "react";
import { PlaylistContext } from "../context/PlaylistContex";

export const usePlaylistContext = () => {
    const context = useContext(PlaylistContext);

    if (!context) {
        throw new Error('usePlaylistContext must be used within an PlaylistContextProvider');
    }

    return context;
};
