import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInterceptors';
import { Sidebar } from '../common/doctorCommon/Sidebar';
import { CreditCard, Calendar, ArrowRight } from 'lucide-react';

// Define interfaces for wallet-related data
interface ITransaction {
  amount: number;
  transactionType?: 'credit' | 'debit';
  description: string;
  date: string;
}

interface IWallet {
  balance: number;
  transactions: ITransaction[];
}

interface IDoctorWalletInfo {
  wallet: IWallet;
}

const DoctorWallet: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<IDoctorWalletInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [filterDate, setFilterDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const transactionsPerPage = 5;

  // Retrieve the doctorId from session storage
  const doctorId = localStorage.getItem('doctorId');

  useEffect(() => {
    if (!doctorId) {
      setError('Doctor ID not found in session.');
      setLoading(false);
      return;
    }

    const fetchWalletInfo = async () => {
      try {
        const response = await axiosInstance.get(`/doctor/profile/${doctorId}`);
        const profile = response.data.data.profile;
        // Provide a default wallet if profile.wallet is undefined
        const walletData: IDoctorWalletInfo = {
          wallet: profile.wallet || { balance: 0, transactions: [] },
        };
        setWalletInfo(walletData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch wallet data.');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletInfo();
  }, [doctorId]);

  // Reset to first page when filterDate changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <div className="animate-pulse">
          <CreditCard className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-xl font-semibold">Loading wallet information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl mx-auto max-w-2xl mt-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="bg-red-600 text-white p-3 rounded-full">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!walletInfo || !walletInfo.wallet) {
    return (
      <div className="text-center text-gray-500 mt-6">
        No wallet info available.
      </div>
    );
  }

  // Filter transactions by date if filterDate is set (comparing YYYY-MM-DD)
  const filteredTransactions = walletInfo.wallet.transactions.filter(transaction => {
    if (!filterDate) return true;
    return transaction.date.slice(0, 10) === filterDate;
  });

  // Pagination calculations
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-800 text-white h-screen fixed top-0 left-0 z-20`}
      >
        <Sidebar onCollapse={(collapsed: boolean | ((prevState: boolean) => boolean)) => setSidebarCollapsed(collapsed)} />
      </div>

      {/* Main Wallet Content */}
      <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Wallet Balance Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-[1.02]">
            <div className="bg-red-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CreditCard className="w-10 h-10" />
                <h2 className="text-3xl font-bold">Wallet Balance</h2>
              </div>
              <span className="text-3xl font-extrabold">₹{walletInfo.wallet.balance}</span>
            </div>
          </div>

          {/* Date Filter */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Calendar className="w-6 h-6 text-red-600" />
              <label htmlFor="filterDate" className="text-gray-700 font-semibold">
                Filter Transactions by Date
              </label>
            </div>
            <input
              type="date"
              id="filterDate"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border-2 border-red-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
            />
          </div>

          {/* Transactions Section */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-red-600 text-white p-4 flex items-center space-x-4">
              <ArrowRight className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Transaction History</h3>
            </div>

            {currentTransactions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {currentTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="p-6 transition-colors duration-300 group hover:bg-green-100"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-gray-500 font-medium">
                        {new Date(transaction.date).toLocaleString()}
                      </p>
                      <span
                        className={`font-semibold px-3 py-1 rounded-full text-sm ${
                          transaction.transactionType === 'debit'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {transaction.transactionType
                          ? transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)
                          : 'Credit'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-700 font-semibold">
                        {transaction.description}
                      </p>
                      <p className="text-xl font-bold text-gray-800">
                        ₹{transaction.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transactions available for the selected date.
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 p-4 flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      currentPage === idx + 1
                        ? 'bg-red-600 text-white scale-105'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorWallet;
