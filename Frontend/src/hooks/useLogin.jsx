import React, { useState } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext';


export const useLogin = () => {
    const { dispatch } = useAuthContext();
    const [error, setError ] = useState({ email: '', password: '', default: '' })
    const [isLoading, setIsLoading] = useState(null)

    const Login = async (email, password) => {
        setIsLoading(true)
        setError({})
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
                        setError({ ...error, email: 'Invalid Email' });
                        break;
                    case "Invalid Password":
                        setError({ ...error, password: 'Invalid Password' });
                        break;
                    default:
                        setError({...error, default: 'Error Logging In' })
                        break;
                }
                setIsLoading(false);
                return;
            } 
            else {
                let userState = {};
                const storedUserState = localStorage.getItem('userState');
                if (storedUserState) {
                  try {
                    userState = JSON.parse(storedUserState);
                    userState.JWT_access = data.JWT_access;
                    userState.Username = data.username;
                    localStorage.setItem('userState', JSON.stringify(userState));
                  } catch (error) {
                    console.log('Error parsing userState:', error);
                    setError({...error, default: 'Error Logging In' })
                  }
                }
                dispatch({ type: 'LOGIN', payload: { JWT_access: data.JWT_access, Username: data.username } });
                setError({}); 
                setIsLoading(false);
            }
        }
        catch (error) {
            console.log('There was an error that occured', error)
            setError({ ...error, default: 'Error Logging In' });
            setIsLoading(false);
        }
    }

    return {Login, isLoading, error}
}
