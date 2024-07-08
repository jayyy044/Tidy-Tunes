import React, { useState } from 'react'
import './RegisterPage.css'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

const RegisterPage = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({username: '', email: ''});

    const handleSubmit = async (event) => {
        // Preventing refresh on submit
        event.preventDefault();
        try{
            const newUser = { username, email, password };

            const response = await fetch('/api/register', {
                method: 'POST',
                body: JSON.stringify(newUser),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const Response = await response.json();

            if (!response.ok) {
                switch (Response.error) {
                    case `The email: ${email} already exists`:
                        setErrors({ ...errors, email: `The email: ${email} already exists` });
                        break;
                    case `The username: ${username} already exists`:
                        setErrors({ ...errors, username: `The username: ${username} already exists` });
                        break;
                    case `Both he email: ${email} and the username ${username} already exists`:
                        setErrors({
                            ...errors,
                            username: `The username: ${username} already exists`,
                            email: `The email: ${email} already exists`
                        });
                        break;
                    default:
                        break;
                }
                return;
            } else {
                setUsername('');
                setEmail('');
                setPassword('');
                setErrors({});
                toast.success(`New user created ! Welcome ${username} to Tidy Tunes`)
                navigate('/')
            }
        }
        catch(error){
            toast.error('Error During Registration');
            console.log(error);
        }
    };

    const handleFocus = (inputName) => {
        setErrors({...errors, [inputName]: ''})

    }

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
                            className={`input_field_UR ${username ? 'has-value' : ''}`} 
                            type="text" 
                            placeholder=" "
                            onChange={(event) => setUsername(event.target.value)}
                            onFocus={() => handleFocus('username')}
                            required
                            value={username}
                            style={{border: errors.username && "2px solid red"}} />

                            <span className={`input_label_UR ${errors.username ? 'error' : ''}`}>Username</span>
                        
                        </label>

                        {errors.username && <div className="Register_Error">{errors.username}</div>}

                        <label className='input_R'>
                            
                            <input 
                            className={`input_field_ER ${email ? 'has-value' : ''}`} 
                            type="email" 
                            placeholder=" "
                            onChange={(event) => setEmail(event.target.value)}
                            onFocus={() => handleFocus('email')}
                            required
                            value={email}
                            style={{border: errors.email && "2px solid red"}} />

                            <span className={`input_label_ER ${errors.email ? 'error' : ''}`}>Email</span>

                        </label>

                        {errors.email && <div className="Register_Error">{errors.email}</div>}
                        
                        <label className='input_R'>
                            
                            <input 
                            className={`input_field_PR ${password ? 'has-value' : ''}`} 
                            type="password" 
                            placeholder=" "
                            onChange={(event) => setPassword(event.target.value)}
                            onFocus={() => handleFocus('password')}
                            required
                            value={password}
                            style={{border: errors.password && "2px solid red"}} />

                            <span className={`input_label_PR ${errors.password ? 'error' : ''}`}>Password</span>

                        </label>
                        <button type="submit">Sign Up</button>
                    </form>  
                </div>
            </div>
        </>
    );
}

export default RegisterPage



  