import React from 'react';
import { useEffect, useRef } from 'react';
import {GoogleLogin} from '@react-oauth/google';


function SocialLogin(props) {

  const { handleGoogleSignIn}= props;
    // useEffect(() => {
    //   // Tải script Google Identity Services
    
    //   const script = document.createElement('script');
    //   script.src = 'https://accounts.google.com/gsi/client';
    //   script.async = true;
    //   document.body.appendChild(script);

    //   // Khởi tạo Google Sign-In khi script tải xong
    //   script.onload = () => {
        
    //     window.google.accounts.id.initialize({
    //       client_id: '678561996244-dhafh8drnjs1ku0dj79ohre8d23nqh47.apps.googleusercontent.com', // Thay bằng Client ID của bạn
    //       callback: handleCredentialResponse,
    //       // ux_mode: 'redirect',
    //       // auto_select: false,
    //       // login_uri: 'http://localhost:5000/auth/google-login', // Thay bằng URL callback của bạn
    //     });
    //       window.google.accounts.id.renderButton(
    //         document.getElementById('buttonDiv'),
    //         { theme: 'outline', size: 'large'}
    //       );
    //     // window.google.accounts.id.prompt(); // Hiển thị One Tap prompt
    //   };

    //   // Dọn dẹp script khi component unmount
    //   return () => {
    //     document.body.removeChild(script);
    //   };
    // }, []); // Chạy một lần khi component mount


    function decodeJWT(token) {

        let base64Url = token.split(".")[1];
        let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        let jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        return JSON.parse(jsonPayload);
      }

      function handleCredentialResponse(response) {

        console.log("Encoded JWT ID token: " + response.credential);

        const responsePayload = decodeJWT(response.credential);

        console.log("Decoded JWT ID token fields:");
        console.log("  Full Name: " + responsePayload.name);
        console.log("  Given Name: " + responsePayload.given_name);
        console.log("  Family Name: " + responsePayload.family_name);
        console.log("  Unique ID: " + responsePayload.sub);
        console.log("  Profile image URL: " + responsePayload.picture);
        console.log("  Email: " + responsePayload.email);
      }


    return (
        <div className="socialLogin">
            <GoogleLogin
              onSuccess={handleGoogleSignIn}
              onError={(error) => console.error("Google Login Error:", error)}
            />
           {/* <button onClick={handleGoogleSignIn} className="google-signin-button">
                <img alt="anh1" src="./google.png" />
                Đăng nhập bằng Google
            </button>  */}
  
             {/* <div id="buttonDiv" ></div> */}
        </div>
    );
}

export default SocialLogin;