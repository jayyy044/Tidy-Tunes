import React, { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import { toast } from 'react-toastify';

export const useSignup = () => {
    const {dispatch} = useAuthContext()
    const [isLoading, setIsLoading] = useState(null);
    const [errors, setErrors] = useState({username: '', email: '', default: ''});
    
    const SignUp = async (username, email, password) => {
        setIsLoading(true)
        setErrors({})
        try{
            const newUser = { username, email, password };
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newUser)
            });
            const data = await response.json();
            if (!response.ok) {
                switch (data.error) {
                    case `The email: ${email} already exists`:
                        setErrors({ ...errors, email: `The email: ${email} already exists` });
                        break;
                    case `The username: ${username} already exists`:
                        setErrors({ ...errors, username: `The username: ${username} already exists` });
                        break;
                    case `Both the email: ${email} and the username ${username} already exists`:
                        setErrors({
                            ...errors,
                            username: `The username: ${username} already exists`,
                            email: `The email: ${email} already exists`,
                        });
                        break;
                    default:
                        setErrors({ ...errors, default: 'Internal Server Error' });
                        break;
                }
                if (errors.default) {
                    toast.error(errors.default);
                }
                setIsLoading(false);
                return;
            }
            else {
                setErrors({})
                const userState = { JWT_access: data.JWT_access, email: data.email }
                localStorage.setItem('UserState', JSON.stringify(userState));
                dispatch({ type: 'LOGIN', payload: userState });
                setIsLoading(false)
                toast.success(`New user created! Welcome ${data.username} to Tidy Tunes`);
            }
        }
        catch (error) {
            console.log('There was an error that occured', error.message)
            toast.error('Error During Registration');
            setIsLoading(false);
        }

    }
    return{ isLoading, SignUp, errors}
}