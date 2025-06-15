import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowLeft, Send } from 'lucide-react';
import { useConsultantSupport } from '../../context/ConsultantSupportContext';
import "../../styles/consultant/ResponeDetail.scss";
import { v4 as uuidv4 } from 'uuid';

const CustomerInfoItem = ({ icon, text }) => {
    return (
        <div className="customer-info-item">
            <div className="customer-info-icon">{icon}</div>
            <span>{text}</span>
        </div>
    );
};

const ResponeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [response, setResponse] = useState("");
    const editorRef = useRef(null);
    const { supportRequests, sendResponse } = useConsultantSupport();

    // Giả lập employeeId, thực tế nên lấy từ context đăng nhập
    const employeeId = 'EMP003';

    useEffect(() => {
        const foundRequest = supportRequests.find(r => String(r.request_id) === String(id));
        if (foundRequest) {
            setRequest(foundRequest);
        } else {
            navigate('/consultantemployee/request-support');
        }
    }, [id, supportRequests, navigate]);

    const handleResponseChange = (e) => {
        if (editorRef.current) {
            setResponse(editorRef.current.innerText);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.execCommand('insertLineBreak');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (request && response.trim()) {
            try {
                const responseId = `RES${uuidv4().replace(/-/g, '').slice(0, 15)}`;
                if (!request.email) {
                    alert('Không tìm thấy email của khách hàng để gửi phản hồi!');
                    return;
                }
                await sendResponse({
                    response_id: responseId,
                    request_id: request.request_id,
                    emp_id: employeeId,
                    re_message: response,
                    day: new Date().toISOString(),
                    customer_email: request.email,
                });
                alert(`Phản hồi đã được gửi đến ${request.email || 'khách hàng'}`);
                setResponse("");
                if (editorRef.current) {
                    editorRef.current.innerText = "";
                }
                navigate('/consultantemployee');
            } catch (err) {
                alert(err.message || 'Gửi phản hồi thất bại!');
            }
        } else {
            alert('Vui lòng nhập nội dung phản hồi!');
        }
    };

    if (!request) {
        return <div>Loading...</div>;
    }

    return (
        <div className="support-container">
            <div className="support-content">
                <div className="mb-6">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ArrowLeft className="back-icon" />
                        <span>Quay lại</span>
                    </button>
                </div>

                <div className="customer-card">
                    <h2 className="customer-title">
                        Thông tin khách hàng yêu cầu hỗ trợ
                    </h2>

                    <div className="customer-grid">
                        <div className="customer-info-row">
                            <div className="customer-info-item">
                                <div className="customer-info-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#339688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                        <path d="M18 20a6 6 0 0 0-12 0" />
                                        <circle cx="12" cy="10" r="4" />
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                </div>
                                <span>{request.customer_name || 'Không rõ tên'}</span>
                            </div>
                            <div className="customer-info-item">
                                <div className="customer-info-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#339688" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <span>{request.phone || 'Không rõ số điện thoại'}</span>
                            </div>
                            <div className="customer-info-item">
                                <span className="customer-id-label">Id khách hàng:</span>
                                <span className="customer-id-value">#{request.cus_id || request.request_id}</span>
                            </div>
                        </div>
                        <div className="customer-info-row">
                            <div className="customer-info-item">
                                <div className="customer-info-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#339688" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                                <span>{request.email || 'Không rõ email'}</span>
                            </div>
                            <div className="customer-info-item">
                                <div className="customer-info-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#339688" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                                <span>{request.created_at ? (() => {
                                    const date = new Date(request.created_at);
                                    if (isNaN(date.getTime())) return 'Không rõ ngày';
                                    const day = date.getUTCDate().toString().padStart(2, '0');
                                    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
                                    const year = date.getUTCFullYear();
                                    return `${day}/${month}/${year}`;
                                })() : 'Không rõ ngày'}</span>
                            </div>
                            <div className="customer-info-item">
                                <span className="request-type">Chủ đề:</span>
                                <span>{request.subject || 'Không rõ chủ đề'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="support-section">
                    <h2 className="support-label">Nội dung yêu cầu:</h2>
                    <div className="support-content-box">
                        <p className="support-content-text">
                            {request.message || 'Không có nội dung'}
                        </p>
                    </div>
                </div>

                <div className="response-card">
                    <div className="editor-toolbar">
                        {/* Formatting Tools */}
                        <div className="formatting-tools">
                            <button className="toolbar-button" onClick={() => document.execCommand('bold', false, '')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5h6a3.5 3.5 0 0 1 0 7H7zm6 7h1a3.5 3.5 0 0 1 0 7H7v-7" />
                                </svg>
                            </button>
                            <button className="toolbar-button" onClick={() => document.execCommand('italic', false, '')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h6M7 19h6m1-14l-4 14" />
                                </svg>
                            </button>
                            <button className="toolbar-button" onClick={() => document.execCommand('underline', false, '')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M8 3v9a4 4 0 0 0 8 0V3h2v9a6 6 0 0 1-12 0V3h2ZM4 20h16v2H4v-2Z" />
                                </svg>
                            </button>
                            <button className="toolbar-button" onClick={() => document.execCommand('strikeThrough', false, '')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><path fill="currentColor" d="M17.154 14c.23.516.346 1.09.346 1.72c0 1.342-.524 2.392-1.571 3.147C14.88 19.622 13.434 20 11.586 20c-1.64 0-3.263-.381-4.87-1.145v-2.254c1.52.877 3.075 1.316 4.666 1.316c2.551 0 3.83-.732 3.839-2.197a2.21 2.21 0 0 0-.648-1.603l-.12-.117H3v-2h18v2h-3.846Zm-4.078-3H7.629a4.086 4.086 0 0 1-.481-.522C6.716 9.92 6.5 9.246 6.5 8.452c0-1.236.466-2.287 1.397-3.153C8.83 4.433 10.271 4 12.222 4c1.471 0 2.879.328 4.222.984v2.152c-1.2-.687-2.515-1.03-3.946-1.03c-2.48 0-3.719.782-3.719 2.346c0 .42.218.786.654 1.099c.436.313.974.563 1.613.75c.62.18 1.297.414 2.03.699Z" /></svg>
                            </button>
                        </div>
                        <div className="divider"></div>
                        <div className="font-dropdown">
                            <select className="dropdown-button" onChange={(e) => document.execCommand('fontName', false, e.target.value)}>
                                <option value="">Font Family</option>
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                            </select>
                        </div>

                        <div className="divider"></div>

                        {/* Blockquote */}
                        <button className="toolbar-button" onClick={() => document.execCommand('formatBlock', false, 'blockquote')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 36 36"><path fill="currentColor" d="M11.86 16.55a4.31 4.31 0 0 0-2.11.56a14.44 14.44 0 0 1 4.36-6a1.1 1.1 0 0 0-1.4-1.7c-4 3.25-5.78 7.75-5.78 10.54A5.08 5.08 0 0 0 10 24.58a4.4 4.4 0 0 0 1.88.44a4.24 4.24 0 1 0 0-8.47Z" className="clr-i-outline clr-i-outline-path-1" /><path fill="currentColor" d="M23 16.55a4.29 4.29 0 0 0-2.11.56a14.5 14.5 0 0 1 4.35-6a1.1 1.1 0 1 0-1.39-1.7c-4 3.25-5.78 7.75-5.78 10.54a5.08 5.08 0 0 0 3 4.61A4.37 4.37 0 0 0 23 25a4.24 4.24 0 1 0 0-8.47Z" className="clr-i-outline clr-i-outline-path-2" /><path fill="none" d="M0 0h36v36H0z" /></svg>
                        </button>

                        {/* More Options (ba chấm ngang) */}
                        <button className="toolbar-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 20 20"><path fill="currentColor" fillRule="evenodd" d="M2.5 7.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5Zm15 0a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5Zm-7.274 0a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5Z" /></svg>
                        </button>
                    </div>
                    <div className="response-text">
                        <div
                            contentEditable
                            ref={editorRef}
                            onInput={handleResponseChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập phản hồi của bạn..."
                        />
                    </div>
                </div>
                <div className="response-actions">
                    <button className="send-button" onClick={handleSubmit}>
                        Gửi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResponeDetail;