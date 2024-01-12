import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from './api/axios';

const ResetPassword = () => {
  const { token } = useParams();
  const pwdRef = useRef();
  const errRef = useRef();

  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if the token is valid (you might want to implement this)
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`/reset-password/${token}`, { pwd });
      console.log(response?.data);
      setSuccess(true);
    } catch (err) {
      if (!err?.response) {
        setErrMsg('No Server Response');
      } else {
        setErrMsg('Reset Failed')
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
            Your password has been reset.
          </p>
        </section>
      ) : (
        <section>
          <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
          <h1>Reset Password</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="password">
              New Password:
            </label>
            <input
              type="password"
              id="password"
              ref={pwdRef}
              autoComplete="off"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
            />
            <button>Reset Password</button>
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

export default ResetPassword;
