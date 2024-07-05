import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { useAuthContext } from '../../hooks/useAuthContext';

const LoginForm = () => {
    const { state, dispatch } = useAuthContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });
    useEffect(() => {
        if (state.token){
            console.log("State token updated:", state.token);
            SpotifyAuthUrl(state.token)
        }
    }, [state.token]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const responseData = await response.json();
            if (!response.ok) {
                switch (responseData.error) {
                    case "Invalid Email":
                        setErrors({ ...errors, email: 'Invalid Email' });
                        break;
                    case "Invalid Password":
                        setErrors({ ...errors, password: 'Invalid Password' });
                        break;
                    case "Invalid Email and Password":
                        setErrors({
                            ...errors,
                            email: 'Invalid Email',
                            password: 'Invalid Password'
                        });
                        break;
                    default:
                        break;
                }
                return;
            } 
            else {
                setEmail('');
                setPassword('');
                setErrors({});
                toast.success('User Logged in! Welcome back to Tidy Tunes');
                dispatch({ type: 'LOGIN', payload: responseData.token });
            }
        } catch (error) {
            toast.error('Error During Logging In');
            console.log(error);
        }
    };
    const handleFocus = (inputName) => {
        setErrors({...errors, [inputName]: ''})

    }
    const SpotifyAuthUrl = async (token) => {
        try {
            if(!token){
                toast.error("Please log in")
                throw new Error("Please Log in")
            }
            const response = await fetch('/api/callback/spotify',{
                headers:{
                    'Authorization': `Bearer ${token}`
            }
            });
            if (!response.ok) {
                throw new Error('Network Response Error');
            }
            const data = await response.json();
            window.location.href = data.authUrl;
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };
    return (
        <div className="Login_Container">
             <div className="Login_WelcomeCard">
                <h1 style= 'color:#dc8b30'>Welcome</h1>
                <h2>
                    Don't have an account? That's okay, click below to sign up.
                </h2>
                <Link to='/register'>Sign Up</Link>
            </div>
            <div className="Login_FormCard">
                {/* <h1>Login</h1>
                <h2>
                    Login and let your Tidy Tunes redefine your music listening.
                </h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email:</label>
                    <br />
                    <input
                        type="email"
                        onChange={(event) => setEmail(event.target.value)}
                        onFocus={() => handleFocus('email')}
                        required
                        value={email}
                        style={{border: errors.email && "2px solid red"}}
                    />
                    {errors.email && <div className="Login_Error">{errors.email}</div>}

                    
                    <label htmlFor="password">Password:</label>
                    <br />
                    <input
                        type="password"
                        onChange={(event) => setPassword(event.target.value)}
                        onFocus={() => handleFocus('password')}
                        required
                        value={password}
                        style={{border: errors.password && "2px solid red"}}
                    />
                    {errors.password && <div className="Login_Error">{errors.password}</div>}

                    
                    <button type="submit">Login</button>
                </form>  */}
            </div>
        </div>
    );
};

export default LoginForm;