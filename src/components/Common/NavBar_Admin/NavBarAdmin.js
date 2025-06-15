import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./NavBarAdmin.scss"


function NavBarAdmin({user, header}) {

    const navigate = useNavigate();
    console.log("user: ", user);
    const handleAvatarClick = () => {
        if(user.role === 'Admin') {
            navigate('/admin/accounts');
        }else if(user.role === 'Sales') {
            navigate('/businessemployee/inforEmployee', {
                state: { user: user }
            });
        } 
    };

    return (
        <div className="navbar-admin">
            <h1 className='navbar-admin__title'>{header}</h1>

            <div className='navbar-admin__user'>
                <span>{user.name}</span>
                <img 
                    src={user.avatar || '/default-avatar.jpg'}
                    alt="avatar" 
                    className='navbar-admin__avatar'
                    onClick={handleAvatarClick}
                    style={{ cursor: 'pointer' }}
                />
            </div>
        </div>
    );
}

export default NavBarAdmin;