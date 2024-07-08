import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { useLogin } from '../../hooks/useLogin'

const LoginForm = () => {
    const { state, dispatch } = useAuthContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    useEffect(() => {
        if (state.token){
            console.log("State token updated:", state.token);
            SpotifyAuthUrl(state.token)
        }
    }, [state.token]);

    const FormSubmit = async (event) => {
        event.preventDefault();
        useLogin()
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const json_response = await response.json();
            if (!response.ok) {
                switch (json_response.error) {
                    case "Invalid Email":
                        setErrors({ ...errors, email: 'Invalid Email' });
                        break;
                    case "Invalid Password":
                        setErrors({ ...errors, password: 'Invalid Password' });
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
                dispatch({ type: 'LOGIN', payload: json_response.token });
            }
        } 
        catch(error){
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
                <h1>Welcome</h1>
                <h2>
                    Don't have an account? That's okay, click below to sign up.
                </h2>
                <Link to='/register'>Sign Up</Link>
            </div>
            <div className="Login_FormCard">
                <h1>Login</h1>
                <h2>
                    Login and let your Tidy Tunes redefine your music listening.
                </h2>
                <form onSubmit={FormSubmit} >

                    <label >
                        <input 
                        className={`input_field_L ${email ? 'has-value' : ''}`} 
                        type="email" 
                        placeholder=" "
                        onChange={(event) => setEmail(event.target.value)}
                        onFocus={() => handleFocus('email')}
                        required
                        value={email}
                        style={{border: errors.email && "2px solid red"}} />
                        <span className={`input_label_EL ${errors.email ? 'error' : ''}`}>Email</span>
                    </label>

                    {errors.email && <div className="Login_Error_E">{errors.email}</div>}

                    <label >
                       <input 
                        className={`input_field_L ${password ? 'has-value' : ''}`}  
                        type="password"
                        placeholder=' '
                        onChange={(event) => setPassword(event.target.value)}
                        onFocus={() => handleFocus('password')}
                        required
                        value={password}
                        style={{border: errors.password && "2px solid red"}} />
                        <span className={`input_label_PL ${errors.password ? 'error' : ''}`} >Password</span>
                    </label>

                    {errors.password && <div className="Login_Error_P">{errors.password}</div>}

                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;