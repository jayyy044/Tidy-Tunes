import React, { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import { usePlaylistContext } from './usePlaylistContext'
import { toast } from 'react-toastify';

export const useLogin = () => {
    const {dispatch:playlistDispatch} = usePlaylistContext()
    const {dispatch} = useAuthContext()
    const [isLoading, setIsLoading] = useState(null);
    const [errors, setErrors] = useState({username: '', email: '', default: ''});

    const Login = async (email, password) => {
        setIsLoading(true)
        setErrors({})
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                switch (data.error) {
                    case "Invalid Email":
                        setErrors({ ...errors, email: 'Invalid Email' });
                        break;
                    case "Invalid Password":
                        setErrors({ ...errors, password: 'Invalid Password' });
                        break;
                    default:
                        setErrors({...errors, default: 'Error Logging In' })
                        break;
                }
                if (errors.default) {
                    toast.error(errors.default);
                }
                setIsLoading(false);
                return;
            } 
            else {
                const User = {JWT_access: data.JWT_access, Email: data.email}
                const playlistStorage = {PlaylistId: data.playlistId, PlaylistName: data.playlistName}
                dispatch({ type: 'LOGIN', payload: User })
                playlistDispatch({ type: 'LOGIN', payload:playlistStorage})
                localStorage.setItem('UserState', JSON.stringify(User));
                localStorage.setItem('PlaylistData', JSON.stringify(playlistStorage))
                setErrors({}); 
                setIsLoading(false);
            }
        }
        catch (error) {
            console.log('There was an error that occured', error.message)
            toast.error('Error During Registration');
            setIsLoading(false);
        }
    }
    return {Login, isLoading, errors}
}
