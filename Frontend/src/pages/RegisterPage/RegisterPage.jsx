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
            <div className="container">
                <div className="welcomeCard_R">
                    <h1 className='welcomeTitle_R'>
                        Welcome
                    </h1>
                    <h2 className='welcomeText_R'>
                        Do you already have an 
                        account with us 
                        click here to login
                    </h2>
                    <Link className='login' to= '/login'>Login</Link>
                </div>
                <div className="formCard_R">
                    <h1 className='formTitle_R'>
                        Create an Account
                    </h1>
                    <h2 className='formText_R'>
                        Begin redefining listening to music today with Tidy Tunes
                    </h2>
                    <form className="create_R" onSubmit={handleSubmit}>
                        <label className= 'label_R' htmlFor="username">Username:</label>
                        <br />
                        <input
                            type="text"
                            className="input_R"
                            onChange={(event) => setUsername(event.target.value)}
                            onFocus={() => handleFocus('username')}
                            required
                            value={username}
                            style={{border: errors.username && "2px solid red"}}
                        />
                        {errors.username && <div className="error">{errors.username}</div>}
                        <br />
                        <label className= 'label_R' htmlFor="email">Email:</label>
                        <br />
                        <input
                            type="email"
                            className="input_R"
                            onChange={(event) => setEmail(event.target.value)}
                            onFocus={() => handleFocus('email')}
                            required
                            value={email}
                            style={{border: errors.email && "2px solid red"}}
                        />
                        {errors.email && <div className="error">{errors.email}</div>}
                        <br />
                        <label className= 'label_R' htmlFor="password">Password:</label>
                        <br />
                        <input
                            type="password"
                            className='input_R'
                            onChange={(event) => setPassword(event.target.value)}
                            onFocus={() => handleFocus('password')}
                            required
                            value={password}
                        />
                        <br />
                        <button className='registerButton_R'>Sign Up</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default RegisterPage



  