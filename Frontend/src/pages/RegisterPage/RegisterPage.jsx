
import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';
import { useSignup } from '../../hooks/useSignup'

const RegisterPage = () => {
    const navigate = useNavigate();
    const { isLoading, SignUp, errors } = useSignup();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        // Preventing refresh on submit
        event.preventDefault();
        await SignUp(username, email, password);
        if (!errors.username && !errors.email && !errors.default) {
            setUsername('');
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
        <>
            <div className="Register_Container">
            <div className="Register_WelcomeCard">
                     <h1>
                        Welcome
                    </h1>
                    <h2>
                        Do you already have an 
                        account with us 
                        click here to login
                    </h2>
                    <Link className='login' to= '/login'>Login</Link>
                </div>
                <div className="Register_FormCard">
                     <h1>
                        Create an Account
                    </h1>
                    <h2>
                        Begin redefining listening to music today with Tidy Tunes
                    </h2>
                    <form onSubmit={handleSubmit}>

                        <label className='input_R'>

                            <input 
                            className={`input_field_R ${username ? 'has-value' : ''}`} 
                            type="text" 
                            placeholder=" "
                            onChange={(event) => setUsername(event.target.value)}
                            onFocus={() => handleFocus('username')}
                            required
                            value={username}
                            style={{border: errors.username && "2px solid red"}} />

                            <span className={`input_label_R ${errors.username ? 'error' : ''}`}>Username</span>
                        
                        </label>

                        {errors.username && <div className="Register_Error_RU">{errors.username}</div>}

                        <label className='input_R'>
                            
                            <input 
                            className={`input_field_R ${email ? 'has-value' : ''}`} 
                            type="email" 
                            placeholder=" "
                            onChange={(event) => setEmail(event.target.value)}
                            onFocus={() => handleFocus('email')}
                            required
                            value={email}
                            style={{border: errors.email && "2px solid red"}} />

                            <span className={`input_label_R ${errors.email ? 'error' : ''}`}>Email</span>

                        </label>

                        {errors.email && <div className="Register_Error_RE">{errors.email}</div>}
                        
                        <label className='input_R'>
                            
                            <input 
                            className={`input_field_R ${password ? 'has-value' : ''}`} 
                            type="password" 
                            placeholder=" "
                            onChange={(event) => setPassword(event.target.value)}
                            onFocus={() => handleFocus('password')}
                            required
                            value={password}
                            style={{border: errors.password && "2px solid red"}} />

                            <span className={`input_label_R ${errors.password ? 'error' : ''}`}>Password</span>

                        </label>
                        <button type="submit">Sign Up</button>
                    </form>  
                </div>
            </div>
        </>
    );
}

export default RegisterPage



  