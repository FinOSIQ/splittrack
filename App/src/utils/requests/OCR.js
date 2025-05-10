import axios from 'axios';

// Replace with your actual API key
const apiKey = import.meta.env.VITE_AZURE_API_KEY; 


//Analyze the receipt image using the Azure Docment Intelligence API
export const analyzeReceipt = async (imageData) => {

    const apiUrl = `${import.meta.env.VITE_AZURE_API_ENDPOINT}`;
    const apiVersion = '2024-11-30';
  

    try {
        const response = await axios.post(apiUrl, imageData, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': apiKey
            },
            params: {
                'api-version': apiVersion
            }
        });
        return response;
    } catch (error) {
        console.error('Error analyzing receipt:', error.response?.data || error.message);
        return error.response; 

    }
};

export const fetchReceiptResults = async (resultUrl) => {
    const maxAttempts = 10;
    const delayMs = 1000; // 2 seconds delay between polls
    let attempt = 0;

    while (attempt < maxAttempts) {
        try {
            const response = await axios.get(resultUrl, {
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey
                }
            });

            const result = response.data;
            console.log(`Polling attempt ${attempt + 1}: Status - ${result.status}`);

            if (result.status === 'succeeded') {
                return result;
            } else if (result.status === 'failed') {
                throw new Error('Receipt analysis failed');
            }

            // Wait before the next poll
            await new Promise(resolve => setTimeout(resolve, delayMs));
            attempt++;
        } catch (error) {
            console.error('Error fetching receipt results:', error.response?.data || error.message);
            throw error;
        }
    }

    throw new Error('Receipt analysis did not complete in time');
};