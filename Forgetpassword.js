import { useState, useRef } from "react";
import axios from './api/axios';

const ForgetPassword = () => {
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/forget-password', { user });
      console.log(response?.data);
      setSuccess(true);
    } catch (err) {
      if (!err?.response) {
        setErrMsg('No Server Response');
      } else if (err.response?.status === 404) {
        setErrMsg('User not found');
      } else {
        setErrMsg('Request Failed')
      }
      errRef.current.focus();
    }
  }

  return (
    <>
      {success ? (
        <section>
          <h1>Success!</h1>
          <p>
            Check your email for further instructions.
          </p>
        </section>
      ) : (
        <section>
          <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
          <h1>Forget Password</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">
              Username:
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
            />
            <button>Submit</button>
          </form>
          <p>
            Remember your password?<br />
            <span className="line">
              <a href="#">Sign In</a>
            </span>
          </p>
        </section>
      )}
    </>
  );
}

export default ForgetPassword;
