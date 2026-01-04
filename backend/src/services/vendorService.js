// backend/src/services/vendorService.js
import axios from 'axios';

export const sendMessage = async ({ to, message, callbackUrl, logId, campaignId }) => {
  // Simulate latency
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(50 + Math.floor(Math.random() * 150));

  const rnd = Math.random();
  const success = rnd <= 0.9;
  const vendorMessage = success ? `Delivered to ${to.email || to._id}` : 'Simulated vendor failure';

  // Simulate calling an external vendor which later posts back to our receipt endpoint.
  try {
    if (callbackUrl) {
      // fire-and-forget the callback (but await so tests / flow can observe)
      await axios.post(
        callbackUrl,
        {
          logId,
          campaignId,
          customerId: to._id,
          status: success ? 'sent' : 'failed',
          response: vendorMessage
        },
        { timeout: 5000 }
      );
    }
  } catch (err) {
    // Vendor callback may fail in real world — log it and continue.
    console.error('Vendor callback failed:', err.message);
  }

  return { success, message: vendorMessage };
};
