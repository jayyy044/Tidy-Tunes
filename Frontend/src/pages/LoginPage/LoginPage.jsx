import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';
import { useLogin } from '../../hooks/useLogin'
import { useSpotifyAuthUrl } from '../../../../test/useSpotifyAuthUrl';
import { useAuthContext } from '../../hooks/useAuthContext';

const LoginForm = () => {
    const {SpotifyAuthUrl} = useSpotifyAuthUrl()
    const {state} = useAuthContext()
    const { isLoading, Login, errors } = useLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (state.JWT_access) {
            console.log("State token updated:");
            SpotifyAuthUrl(state.JWT_access);
        }
    }, [state.JWT_access]);

    const FormSubmit = async (event) => {
        event.preventDefault();
        await Login(email,password)
        if (!errors.username && !errors.email && !errors.default) {
            setEmail('');
            setPassword('');
        }
    };
    const handleFocus = (inputName) => {
        if (errors[inputName]) {
            errors[inputName] = '';
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
                        <span className={`input_label_L ${errors.email ? 'error' : ''}`}>Email</span>
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
                        <span className={`input_label_L ${errors.password ? 'error' : ''}`} >Password</span>
                    </label>

                    {errors.password && <div className="Login_Error_P">{errors.password}</div>}

                    <button type="submit" disabled={isLoading}>Login</button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;