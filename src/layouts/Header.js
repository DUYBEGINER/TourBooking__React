import React, {useState} from 'react';
import Navbar from "./Navbar";
import '../styles/layouts/Header.scss';
import Searchbar from '../components/Searchbar/Searchbar';
function Header(props) {

    const [isVideoOpen, setIsVideoOpen] = useState(false);

    
    const openVideoPopup = () => {
        setIsVideoOpen(true);
    };

    const closeVideoPopup = () => {
        setIsVideoOpen(false);
    };


    return (
        <div className='header'>
        <Navbar/>
        <div className="header__content">
            <img src='/background.png' alt='background' className='header__background-img'/>
            <h1 className='header__title'>Chúng tôi tìm cho bạn những tour tuyệt vời</h1>
            <p className='header__intro-text'>Hãy để chúng tôi giúp bạn lên kế hoạch cho chuyến đi hoàn hảo nhất. Từ những bãi biển đầy nắng đến các điểm đến kỳ thú, mọi hành trình đều là một trải nghiệm đáng nhớ.</p>
            <div className="header__video-area">
            <div className="header__circle-button" onClick={openVideoPopup}>
                <div className="header__play-icon" ></div>
            </div>
            <p className='header__watch-text' onClick={openVideoPopup}>Xem video</p>
            </div>
        </div>
        <Searchbar/>
         {isVideoOpen && (
                <div className="video_area">
                    <div className="video rounded-lg p-4 max-w-[90vw] w-full relative">
                         <button
                            onClick={closeVideoPopup}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
                            aria-label="Close YouTube video"
                        >
                            ×
                        </button>
                        <div className="relative" style={{ paddingTop: '56.25%' }}>
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src="https://www.youtube.com/embed/Zcx247sfxPM?si=B7zGodd44HXGGWkj" 
                                title="YouTube video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}

export default Header;