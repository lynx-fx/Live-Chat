import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import "../styles/login.css";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const responseGoogle = async (res) => {
    try {
      if (res['code']){
        // TODO: Make API Call with code here
      }
    } catch (err) {
      console.log("Err: ", err);
    }
  };

  const handleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div className="login-page-container">
      <motion.div
        className="login-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="login-header">
          <motion.h1 className="login-title" variants={itemVariants}>
            Login to your account
          </motion.h1>
          <motion.p className="login-subtitle" variants={itemVariants}>
            Sign in with your Google account to continue.
          </motion.p>
        </div>
        <motion.div variants={itemVariants}>
          {/* <Link to="/dashboard"> */}
          <button className="google-login-button" onClick={handleLogin}>
            <FcGoogle className="google-icon" />
            Login with Google
          </button>
          {/* </Link> */}
        </motion.div>
      </motion.div>
    </div>
  );
}
