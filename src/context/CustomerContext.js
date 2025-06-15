import React, { createContext, useState, useEffect } from 'react';
import { getCustomerAccount, blockCustomer, blockBatchCustomer, deleteBatchCustomer, deleteCustomer } from '../api/customerAccountAPI';

export const CustomerContext = createContext();

export const CustomerProvider = ({children}) => {
    const [customerAccount, setCustomerAccount] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchCustomerAccount = async (filter='') => {
        try{
            const data = await getCustomerAccount(filter);
            setCustomerAccount(data);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchCustomerAccount();
    }, []);

    // if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const handleBlockCustomer = async (id) => {
        try{
            setLoading(true);
            const result = await blockCustomer(id);
            setCustomerAccount((prev) => prev.filter((cus) => cus.cus_id !== id));
            setError(null);
            return result;
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }

    const handleBlockBatchCustomer = async (ids) => {
        try{
            setLoading(true);
            const result = await blockBatchCustomer(ids);
            setCustomerAccount((prev) => prev.filter((cus) => !ids.includes(cus.cus_id)));
            setError(null);
            return result;
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }

    const handleDeleteCustomer = async (id) => {
        try{
            setLoading(true);
            const result = await deleteCustomer(id);
            setCustomerAccount((prev) => prev.filter((cus) => cus.cus_id !== id));
            setError(null);
            return result;
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }

    const handleDeleteBatchCustomer = async (ids) => {
        try{
          setLoading(true);
          const result = await deleteBatchCustomer(ids);
          setCustomerAccount((prev) => prev.filter((cus) => !ids.includes(cus.cus_id)));
          setError(null);
          return result;
        }catch(err){
          setError(err.message);
        }finally{
          setLoading(false);
        }
      }

    const value = {
        customerAccount,
        loading,
        error,
        fetchCustomerAccount,
        blockCustomer: handleBlockCustomer,
        blockBatchCustomer: handleBlockBatchCustomer,
        deleteCustomer: handleDeleteCustomer,
        deleteBatchCustomer: handleDeleteBatchCustomer,
    };
    return (
        <CustomerContext.Provider value={value}>
            {children}
        </CustomerContext.Provider>
    );
}
