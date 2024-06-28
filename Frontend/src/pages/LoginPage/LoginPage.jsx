import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css'
import { useAuthContext } from '../../hooks/useAuthContext';

const LoginForm = () => {
    const { dispatch } = useAuthContext()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({email: '', password: ''});
    const navigate = useNavigate();
    

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
                    case("Invalid Password"):
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
                dispatch({ type: 'LOGIN', payload: responseData.token });
                const SpotifyAuthUrl = async () => {
                    try {
                        if(!state.token){
                        toast.error("Please log in")
                        throw new Error("Please Log in")
                        }
                        const response = await fetch('/api/auth/spotify',{
                        headers:{
                            'Authorization': `Bearer ${state.token}`
                        }
                        });
                        if (!response.ok) {
                        throw new Error('Network response was not ok');
                        }
                        const data = await response.json();
                        window.location.href = data.authUrl;
                    } catch (error) {
                        console.error('An error occurred:', error);
                    }
                };
                SpotifyAuthUrl();
            }
        } catch (error) {
            toast.error('Error During Logging In');
            console.log(error);
        }
    };
    const handleFocus = (inputName) => {
        setErrors({...errors, [inputName]: ''})

    }
    return (
        <div className="container_L">
            <div className="welcomeCard_L">
                <h1 className='welcomeTitle_L'>Welcome</h1>
                <h2 className='welcomeText_L'>
                    Don't have an account? That's okay, click below to sign up.
                </h2>
                <Link className='signUP' to='/register'>Sign Up</Link>
            </div>
            <div className="formCard_L">
                <h1 className='formTitle_L'>Login</h1>
                <h2 className='formText_L'>
                    Login and let your Tidy Tunes redefine your music listening.
                </h2>
                <form className="create_L" onSubmit={handleSubmit}>
                    <label className='label_L' htmlFor="email">Email:</label>
                    <br />
                    <input
                        type="email"
                        className='input_L'
                        onChange={(event) => setEmail(event.target.value)}
                        onFocus={() => handleFocus('email')}
                        required
                        value={email}
                        style={{border: errors.password && "1px solid red"}}
                    />
                    {errors.email && <div className="error">{errors.email}</div>}

                    
                    <label className='label_L' htmlFor="password">Password:</label>
                    <br />
                    <input
                        type="password"
                        className='input_L'
                        onChange={(event) => setPassword(event.target.value)}
                        onFocus={() => handleFocus('password')}
                        required
                        value={password}
                        style={{border: errors.password && "1px solid red"}}
                    />
                    {errors.password && <div className="error">{errors.password}</div>}

                    
                    <button className ='registerButton_L'type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;