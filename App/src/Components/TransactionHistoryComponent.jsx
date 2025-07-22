// src/components/TransactionHistoryComponent.jsx
import React, { useState } from 'react';
import OwedCardSettleup from './OwedCardSettleup';
import { settleUpPayments } from '../utils/requests/SettleUp';
import { toast } from 'sonner';

export default function TransactionHistoryComponent({
  transactions = [],
  activeTab = "toPay",
  onPaymentSuccess, // New prop for refreshing parent component
}) {
  const [selectedExpenses, setSelectedExpenses] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [modalStep, setModalStep] = useState(1); // Step 1: Amount, Step 2: Payment Type, Step 3: Card Details
  const [paymentType, setPaymentType] = useState(''); // 'hand', 'online'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const isToPaySection = activeTab === "toPay";

  // Handle checkbox change
  const handleCheckboxChange = (expenseId, isChecked) => {
    setSelectedExpenses(prev => ({
      ...prev,
      [expenseId]: isChecked
    }));
  };

  // Check if any expense is selected
  const hasSelectedExpenses = Object.values(selectedExpenses).some(Boolean);

  // Handle Pay Now button click
  const handlePayNowClick = () => {
    if (hasSelectedExpenses) {
      // Initialize payment amounts for selected expenses
      const initialAmounts = {};
      transactions
        .filter(tx => selectedExpenses[tx.id])
        .forEach(tx => {
          initialAmounts[tx.id] = '';
        });
      setPaymentAmounts(initialAmounts);
      setModalStep(1);
      setPaymentType('');
      setShowPaymentModal(true);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowPaymentModal(false);
    setPaymentAmounts({});
    setModalStep(1);
    setPaymentType('');
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
  };

  // Handle payment amount change for individual expense
  const handlePaymentAmountChange = (expenseId, amount) => {
    setPaymentAmounts(prev => ({
      ...prev,
      [expenseId]: amount
    }));
  };

  // Handle card details change
  const handleCardDetailsChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle Next button in modal (Step 1 -> Step 2)
  const handleNext = () => {
    const selectedTxs = transactions.filter(tx => selectedExpenses[tx.id]);
    const paymentData = selectedTxs.map(tx => ({
      expenseId: tx.id,
      expenseName: tx.title,
      paymentAmount: parseFloat(paymentAmounts[tx.id] || 0),
      maxAmount: parseFloat(tx.amount.split(' ')[0])
    }));
    
    console.log('Payment data:', paymentData);
    setModalStep(2);
  };

  // Handle Payment Type Selection (Step 2 -> Step 3 or direct completion)
  const handlePaymentTypeNext = () => {
    if (paymentType === 'online') {
      setModalStep(3); // Go to card details
    } else {
      // For hand payment, complete directly
      handleConfirmPayment();
    }
  };

  // Handle Back button
  const handleBack = () => {
    if (modalStep === 3) {
      setModalStep(2); // Card details -> Payment type
    } else if (modalStep === 2) {
      setModalStep(1); // Payment type -> Amount entry
    }
  };

  // Handle Confirm Payment - Call API for both hand and online payments
  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      const totalAmount = getTotalPaymentAmount();
      
      // Prepare API payload (same for both hand and online)
      const apiPayload = {
        payments: transactions
          .filter(tx => selectedExpenses[tx.id])
          .map(tx => ({
            expenseId: tx.id,
            paymentAmount: parseFloat(paymentAmounts[tx.id] || 0)
          }))
      };
      
      console.log('Calling settleUp API with payload:', apiPayload);
      
      // Call the settleUp API
      const response = await settleUpPayments(apiPayload.payments);
      
      if (response && response.status === 'success') {
        console.log('Payment successful:', response);
        
        // Close modal and reset state
        handleModalClose();
        setSelectedExpenses({});
        
        // Call parent refresh function if provided
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
        
        // Show success message
        toast.success('Payment Processed successfully!');
      } else {
        throw new Error(response?.message || 'Payment failed');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(`Payment failed: ${error.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Calculate total payment amount
  const getTotalPaymentAmount = () => {
    return Object.values(paymentAmounts).reduce((total, amount) => {
      return total + parseFloat(amount || 0);
    }, 0);
  };

  return (
    <>
      <div className="relative bg-white rounded-2xl p-4 flex flex-col h-full">
        <div className="flex-1 space-y-4 pr-2 overflow-y-auto scrollable-div">
          {transactions.length > 0 ? (
            transactions.map(tx => (
              <OwedCardSettleup 
                key={tx.id} 
                {...tx}
                showCheckbox={isToPaySection}
                isChecked={selectedExpenses[tx.id] || false}
                onCheckboxChange={handleCheckboxChange}
                expenseId={tx.id}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 mt-6">No transactions yet</p>
          )}
        </div>
        
        {/* Pay Now Button - only for To Pay section */}
        {isToPaySection && (
          <button 
            className={`mt-4 self-end px-4 py-2 font-inter text-sm rounded-lg transition-colors ${
              hasSelectedExpenses 
                ? 'bg-[#040B2B] text-white hover:bg-[#040B2B]/90' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handlePayNowClick}
            disabled={!hasSelectedExpenses}
          >
            Pay Now
          </button>
        )}
      </div>

      {/* Payment Modal with 3 Steps */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-md mx-4 max-h-[80vh] overflow-hidden">
            
            {/* Step 1: Amount Entry */}
            {modalStep === 1 && (
              <>
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Enter Payment Amount</h3>
                  <p className="text-sm text-gray-600">Enter payment amounts for selected expenses</p>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {transactions
                      .filter(tx => selectedExpenses[tx.id])
                      .map(tx => {
                        const maxAmount = parseFloat(tx.amount.split(' ')[0]);
                        return (
                          <div key={tx.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="mb-3">
                              <h4 className="font-medium text-gray-900 text-sm">{tx.title}</h4>
                              <p className="text-xs text-gray-500">{tx.description}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                Maximum: {maxAmount.toFixed(2)} LKR
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <label className="text-sm font-medium text-gray-700">Amount:</label>
                              <div className="flex items-center space-x-2 flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  max={maxAmount}
                                  step="0.01"
                                  placeholder="0.00"
                                  value={paymentAmounts[tx.id] || ''}
                                  onChange={(e) => handlePaymentAmountChange(tx.id, e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#040b2b] focus:border-[#040b2b]"
                                />
                                <span className="text-sm text-gray-600">LKR</span>
                                <button
                                  onClick={() => handlePaymentAmountChange(tx.id, maxAmount.toFixed(2))}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                  Max
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={handleModalClose}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-sm text-white bg-[#040b2b] rounded-lg hover:bg-[#040b2b]/90"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Payment Type Selection */}
            {modalStep === 2 && (
              <>
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Select Payment Type</h3>
                  <p className="text-sm text-gray-600">Choose how you want to make the payment</p>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-6">
                  {/* Total Amount */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                      <span className="text-lg font-bold text-[#040b2b]">
                        {getTotalPaymentAmount().toFixed(2)} LKR
                      </span>
                    </div>
                  </div>

                  {/* Payment Type Options */}
                  <div className="space-y-3">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        paymentType === 'hand' ? 'border-[#040b2b] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentType('hand')}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="paymentType"
                          value="hand"
                          checked={paymentType === 'hand'}
                          onChange={() => setPaymentType('hand')}
                          className="w-4 h-4 text-[#040b2b] border-gray-300"
                        />
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">💸 Hand Payment</h4>
                          <p className="text-sm text-gray-600">Pay in person with cash or physical transfer</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        paymentType === 'online' ? 'border-[#040b2b] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentType('online')}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="paymentType"
                          value="online"
                          checked={paymentType === 'online'}
                          onChange={() => setPaymentType('online')}
                          className="w-4 h-4 text-[#040b2b] border-gray-300"
                        />
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">💳 Online Payment</h4>
                          <p className="text-sm text-gray-600">Pay with credit/debit card</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <div className="space-x-3">
                    <button
                      onClick={handleModalClose}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePaymentTypeNext}
                      disabled={!paymentType || isProcessingPayment}
                      className={`px-4 py-2 text-sm rounded-lg ${
                        paymentType && !isProcessingPayment
                          ? paymentType === 'hand' 
                            ? 'text-white bg-green-600 hover:bg-green-700'
                            : 'text-white bg-[#040b2b] hover:bg-[#040b2b]/90'
                          : 'text-gray-500 bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {isProcessingPayment ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : !paymentType ? (
                        'Next'
                      ) : paymentType === 'hand' ? (
                        'Confirm Payment'
                      ) : (
                        'Next'
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Card Details (Only for Online Payment) */}
            {modalStep === 3 && (
              <>
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
                  <p className="text-sm text-gray-600">Enter your card details to complete payment</p>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  {/* Total Amount */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                      <span className="text-lg font-bold text-[#040b2b]">
                        {getTotalPaymentAmount().toFixed(2)} LKR
                      </span>
                    </div>
                  </div>

                  {/* Card Details Form */}
                  <div className="space-y-4">
                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardholderName}
                        onChange={(e) => handleCardDetailsChange('cardholderName', e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#040b2b] focus:border-[#040b2b]"
                      />
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#040b2b] focus:border-[#040b2b]"
                      />
                    </div>

                    {/* Expiry Date and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiryDate}
                          onChange={(e) => handleCardDetailsChange('expiryDate', e.target.value)}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#040b2b] focus:border-[#040b2b]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => handleCardDetailsChange('cvv', e.target.value)}
                          placeholder="123"
                          maxLength="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#040b2b] focus:border-[#040b2b]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <div className="space-x-3">
                    <button
                      onClick={handleModalClose}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName || isProcessingPayment}
                      className={`px-4 py-2 text-sm rounded-lg ${
                        cardDetails.cardNumber && cardDetails.expiryDate && cardDetails.cvv && cardDetails.cardholderName && !isProcessingPayment
                          ? 'text-white bg-green-600 hover:bg-green-700'
                          : 'text-gray-500 bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {isProcessingPayment ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        'Confirm Payment'
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}