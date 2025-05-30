import axios from "axios";
import { API_URL } from "../utils/API_Port";

export const getCustomerAccount = async () => {
    const response = await axios.get(`${API_URL}/customers`,
        { withCredentials: true } // Đảm bảo gửi cookie
    );
    return response.data;
}

export const updateCustomer = async (id, data) => {
    try{
        
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("phone", data.phone);
        formData.append("address", data.address);
        formData.append("image", data.image);
        
        const response = await axios.put(`${API_URL}/customers/update/${id}`, formData, {
            withCredentials: true,
        });
        return response.data;
    }catch(error){
        throw new Error(error.response?.data?.message || "Lỗi khi cập nhật thông tin khách hàng");
    }
   
}

export const blockCustomer = async (id) => {
    try{
        const response = await axios.put(`${API_URL}/customers/block/${id}`, {}, {
            withCredentials: true,
        });
        return response.data;
    }catch(error){
        throw new Error(error.response?.data?.message || "Lỗi khi khóa khách hàng");
    }
}

export const blockBatchCustomer = async (ids) => {
    try{
        const response = await axios.put(`${API_URL}/customers/block_batch`, { ids }, {
            withCredentials: true,
        });
        return response.data;
    }catch(error){
        throw new Error(error.response?.data?.message || "Lỗi khi khóa khách hàng");
    }
}

export const deleteBatchCustomer = async (ids) => {
    const response = await axios.delete(`${API_URL}/customers/batch-delete`, {
        data: { ids }
    });
    return response.data;
}

export const deleteCustomer = async (id) => {
    const response = await axios.delete(`${API_URL}/customers/${id}`);
    return response.data;
}
